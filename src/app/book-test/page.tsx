"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle, TestTube } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const bookTestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  age: z.coerce
    .number({ invalid_type_error: "Please enter a valid age" })
    .min(1, "Age must be at least 1")
    .max(120, "Please enter a valid age"),
  address: z.string().min(5, "Full address is required").max(500),
  contact: z
    .string()
    .min(10, "Enter a valid 10-digit contact number")
    .max(15, "Enter a valid contact number"),
});

type BookTestFormData = z.infer<typeof bookTestSchema>;

const BookBloodTest = () => {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookTestFormData>({
    resolver: zodResolver(bookTestSchema),
  });

  const onSubmit = (data: BookTestFormData) => {
    console.log("Blood test booking:", data);
    // TODO: Submit to Supabase when connected
    setSubmitted(true);
    toast.success("Blood test booked successfully!");
  };

  /* ── Success Screen ── */
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
            <CheckCircle className="h-16 w-16 text-primary" />
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Booking Confirmed!
            </h2>
            <p className="text-muted-foreground">
              Your blood test has been booked. We will contact you shortly to
              confirm the schedule.
            </p>
            <Button variant="hero" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              <CardTitle className="font-serif text-xl">
                Book Blood Test
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {/* Name */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-primary">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Age */}
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                {...register("age")}
              />
              {errors.age && (
                <p className="mt-1 text-sm text-primary">
                  {errors.age.message}
                </p>
              )}
            </div>

            {/* Full Address */}
            <div>
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                placeholder="House No, Street, City, State, PIN Code"
                rows={3}
                {...register("address")}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-primary">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                type="tel"
                placeholder="+91 98765 43210"
                {...register("contact")}
              />
              {errors.contact && (
                <p className="mt-1 text-sm text-primary">
                  {errors.contact.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="mt-2 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting…" : "Submit Booking"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookBloodTest;
