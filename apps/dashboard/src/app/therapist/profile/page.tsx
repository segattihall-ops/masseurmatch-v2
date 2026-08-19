"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@masseurmatch/ui";
import { Save, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    display_name: "",
    headline: "",
    bio: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    incall_price: "",
    outcall_price: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Edit Your Profile</h1>
        <p className="text-text-secondary">Update your professional information and services</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-900">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-primary">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-text-primary">
                Display Name
              </label>
              <Input
                id="display_name"
                name="display_name"
                type="text"
                value={formData.display_name}
                onChange={handleChange}
                placeholder="How clients will see your name"
              />
            </div>

            <div>
              <label htmlFor="headline" className="block text-sm font-medium text-text-primary">
                Professional Headline
              </label>
              <Input
                id="headline"
                name="headline"
                type="text"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g., Licensed Massage Therapist specializing in Deep Tissue"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-text-primary">
                About You
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell clients about your experience and approach"
                className="h-32 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder-text-secondary"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-primary">Location</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-text-primary">
                City
              </label>
              <Input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Denver"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-text-primary">
                State
              </label>
              <Input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g., CO"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-primary">Contact Information</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-primary">
                Phone
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone number"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email address"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-primary">Pricing</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="incall_price" className="block text-sm font-medium text-text-primary">
                In-Call Rate (per hour)
              </label>
              <div className="flex items-center">
                <span className="text-text-secondary">$</span>
                <Input
                  id="incall_price"
                  name="incall_price"
                  type="number"
                  value={formData.incall_price}
                  onChange={handleChange}
                  placeholder="0"
                  className="rounded-l-none border-l-0"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="outcall_price"
                className="block text-sm font-medium text-text-primary"
              >
                Outcall Rate (per hour)
              </label>
              <div className="flex items-center">
                <span className="text-text-secondary">$</span>
                <Input
                  id="outcall_price"
                  name="outcall_price"
                  type="number"
                  value={formData.outcall_price}
                  onChange={handleChange}
                  placeholder="0"
                  className="rounded-l-none border-l-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
