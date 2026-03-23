import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Upload, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const donorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  age: z.coerce.number().min(18, "Must be at least 18").max(65, "Must be under 65"),
  bloodGroup: z.string().min(1, "Please select a blood group"),
  medicalConditions: z.string().max(500).optional(),
  address: z.string().min(5, "Address is required").max(300),
  contact: z.string().min(10, "Enter a valid contact number").max(15),
});

type DonorFormData = z.infer<typeof donorSchema>;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const DonorRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<DonorFormData>({
    resolver: zodResolver(donorSchema),
  });

  const nextStep = async () => {
    const fieldsPerStep: Record<number, (keyof DonorFormData)[]> = {
      1: ["name", "age", "bloodGroup"],
      2: ["medicalConditions", "address", "contact"],
    };
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep(step + 1);
  };

  const onSubmit = (data: DonorFormData) => {
    console.log("Donor data:", data, "File:", file);
    // TODO: Submit to Supabase when connected
    setSubmitted(true);
    toast.success("Registration submitted successfully!");
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
            <CheckCircle className="h-16 w-16 text-primary" />
            <h2 className="font-serif text-2xl font-bold text-foreground">Thank You!</h2>
            <p className="text-muted-foreground">Your donor registration has been submitted.</p>
            <Button variant="hero" onClick={() => navigate("/")}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="font-serif text-xl">Donor Registration — Step {step} of 3</CardTitle>
          </div>
          {/* Progress bar */}
          <div className="mt-3 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" {...register("name")} />
                  {errors.name && <p className="mt-1 text-sm text-primary">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="25" {...register("age")} />
                  {errors.age && <p className="mt-1 text-sm text-primary">{errors.age.message}</p>}
                </div>
                <div>
                  <Label>Blood Group</Label>
                  <Select onValueChange={(v) => setValue("bloodGroup", v)}>
                    <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((bg) => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bloodGroup && <p className="mt-1 text-sm text-primary">{errors.bloodGroup.message}</p>}
                </div>
                <Button type="button" variant="hero" className="mt-2 w-full" onClick={nextStep}>
                  Next <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label htmlFor="medicalConditions">Medical Conditions (optional)</Label>
                  <Textarea id="medicalConditions" placeholder="Any known conditions..." {...register("medicalConditions")} />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="123 Main St, City" {...register("address")} />
                  {errors.address && <p className="mt-1 text-sm text-primary">{errors.address.message}</p>}
                </div>
                <div>
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input id="contact" placeholder="+1 234 567 8900" {...register("contact")} />
                  {errors.contact && <p className="mt-1 text-sm text-primary">{errors.contact.message}</p>}
                </div>
                <Button type="button" variant="hero" className="mt-2 w-full" onClick={nextStep}>
                  Next <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <Label>Upload Blood Report (PDF)</Label>
                  <div
                    className="mt-2 flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-secondary p-8 transition-colors hover:border-primary/60"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Upload className="h-10 w-10 text-primary/60" />
                    <p className="text-sm text-muted-foreground">
                      {file ? file.name : "Click to upload your blood report PDF"}
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setFile(f);
                      }}
                    />
                  </div>
                </div>
                <Button type="submit" variant="hero" className="mt-4 w-full">
                  Submit Registration
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonorRegistration;
