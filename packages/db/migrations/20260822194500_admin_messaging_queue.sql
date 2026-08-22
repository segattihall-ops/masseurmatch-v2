begin;

create or replace function public.admin_queue_messaging_message(
  p_admin_user_id uuid,
  p_contact_id uuid,
  p_body text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_contact public.messaging_contacts%rowtype;
  v_settings public.messaging_settings%rowtype;
  v_conversation_id uuid;
  v_message_id uuid;
  v_queue_id uuid;
  v_idempotency_key text;
  v_now timestamptz := now();
begin
  if p_admin_user_id is null or p_contact_id is null then
    raise exception 'Admin user and contact are required';
  end if;
  if trim(coalesce(p_body, '')) = '' then
    raise exception 'Message body is required';
  end if;
  if length(p_body) > 4000 then
    raise exception 'Message body is too long';
  end if;

  select * into v_contact
  from public.messaging_contacts
  where id = p_contact_id
  for update;

  if not found then
    raise exception 'Contact not found';
  end if;
  if v_contact.opted_out then
    raise exception 'This contact is opted out and cannot be messaged';
  end if;

  select * into v_settings
  from public.messaging_settings
  where id = 'default'
  for share;

  if not found then
    raise exception 'Messaging settings are not configured';
  end if;
  if v_settings.global_pause then
    raise exception 'Messaging is globally paused';
  end if;

  select conversation.id into v_conversation_id
  from public.messaging_conversations conversation
  where conversation.contact_id = p_contact_id
    and conversation.receiving_number = v_settings.receiving_number
    and conversation.status = 'open'
  order by conversation.created_at desc
  limit 1
  for update;

  if v_conversation_id is null then
    insert into public.messaging_conversations (
      contact_id,
      receiving_number,
      current_channel,
      knotty_enabled,
      last_message_at,
      last_outbound_at,
      updated_at
    ) values (
      p_contact_id,
      v_settings.receiving_number,
      'unknown',
      v_contact.knotty_enabled,
      v_now,
      v_now,
      v_now
    ) returning id into v_conversation_id;
  end if;

  v_idempotency_key := 'manual:' || p_contact_id::text || ':' || gen_random_uuid()::text;

  insert into public.messaging_messages (
    conversation_id,
    contact_id,
    direction,
    sender_type,
    body,
    channel,
    delivery_status,
    idempotency_key,
    user_id,
    created_at,
    updated_at
  ) values (
    v_conversation_id,
    p_contact_id,
    'outbound',
    'human',
    trim(p_body),
    'unknown',
    'queued',
    v_idempotency_key,
    v_contact.user_id,
    v_now,
    v_now
  ) returning id into v_message_id;

  insert into public.messaging_queue (
    contact_id,
    conversation_id,
    message_id,
    body,
    transport_preference,
    status,
    idempotency_key,
    scheduled_for,
    user_id,
    created_at,
    updated_at
  ) values (
    p_contact_id,
    v_conversation_id,
    v_message_id,
    trim(p_body),
    coalesce(nullif(v_settings.transport_mode, ''), 'automatic'),
    'pending',
    v_idempotency_key,
    v_now,
    v_contact.user_id,
    v_now,
    v_now
  ) returning id into v_queue_id;

  update public.messaging_contacts
  set last_outbound_at = v_now, last_activity_at = v_now, updated_at = v_now
  where id = p_contact_id;

  update public.messaging_conversations
  set last_message_at = v_now, last_outbound_at = v_now, updated_at = v_now
  where id = v_conversation_id;

  return jsonb_build_object(
    'messageId', v_message_id,
    'queueId', v_queue_id,
    'conversationId', v_conversation_id,
    'status', 'pending',
    'scheduledFor', v_now
  );
end;
$function$;

revoke all on function public.admin_queue_messaging_message(uuid, uuid, text) from public;
revoke all on function public.admin_queue_messaging_message(uuid, uuid, text) from anon;
revoke all on function public.admin_queue_messaging_message(uuid, uuid, text) from authenticated;
grant execute on function public.admin_queue_messaging_message(uuid, uuid, text) to service_role;

commit;
