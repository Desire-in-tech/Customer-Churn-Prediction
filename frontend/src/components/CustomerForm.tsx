import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CustomerInput,
  usePredictChurn,
  CustomerInputMultipleLines,
  CustomerInputInternetService,
  CustomerInputOnlineSecurity,
  CustomerInputDeviceProtection,
  CustomerInputTechSupport,
  CustomerInputStreamingTV,
  CustomerInputStreamingMovies,
  CustomerInputContract,
  CustomerInputPaymentMethod,
  PredictionResult,
} from "@/lib/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetPredictionHistoryQueryKey } from "@/lib/api";

const formSchema = z.object({
  tenure: z.coerce.number().min(0).max(120),
  monthlyCharges: z.coerce.number().min(0),
  totalCharges: z.coerce.number().min(0),
  gender: z.enum(["Male", "Female"]),
  seniorCitizen: z.coerce.number().refine((val) => val === 0 || val === 1),
  partner: z.enum(["Yes", "No"]),
  dependents: z.enum(["Yes", "No"]),
  phoneService: z.enum(["Yes", "No"]),
  multipleLines: z.enum(["Yes", "No", "No phone service"]),
  internetService: z.enum(["DSL", "Fiber optic", "No"]),
  onlineSecurity: z.enum(["Yes", "No", "No internet service"]),
  onlineBackup: z.enum(["Yes", "No", "No internet service"]),
  deviceProtection: z.enum(["Yes", "No", "No internet service"]),
  techSupport: z.enum(["Yes", "No", "No internet service"]),
  streamingTV: z.enum(["Yes", "No", "No internet service"]),
  streamingMovies: z.enum(["Yes", "No", "No internet service"]),
  contract: z.enum(["Month-to-month", "One year", "Two year"]),
  paperlessBilling: z.enum(["Yes", "No"]),
  paymentMethod: z.enum([
    "Electronic check",
    "Mailed check",
    "Bank transfer (automatic)",
    "Credit card (automatic)",
  ]),
});

type FormValues = z.infer<typeof formSchema>;

export default function CustomerForm({
  onResult,
}: {
  onResult: (result: PredictionResult) => void;
}) {
  const queryClient = useQueryClient();
  const predictMutation = usePredictChurn();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenure: 2,
      monthlyCharges: 95,
      totalCharges: 190,
      gender: "Male",
      seniorCitizen: 0,
      partner: "No",
      dependents: "No",
      phoneService: "Yes",
      multipleLines: "Yes",
      internetService: "Fiber optic",
      onlineSecurity: "No",
      onlineBackup: "No",
      deviceProtection: "No",
      techSupport: "No",
      streamingTV: "No",
      streamingMovies: "No",
      contract: "Month-to-month",
      paperlessBilling: "Yes",
      paymentMethod: "Electronic check",
    },
  });

  function onSubmit(data: FormValues) {
    predictMutation.mutate(
      { data: data as CustomerInput },
      {
        onSuccess: (res: PredictionResult) => {
          onResult(res);
          queryClient.invalidateQueries({
            queryKey: getGetPredictionHistoryQueryKey(),
          });
        },
      },
    );
  }

  return (
    <Card className="border-border shadow-md">
      <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
        <CardTitle className="text-xl">Profile Input</CardTitle>
        <CardDescription>
          Adjust the parameters below to test the model's sensitivity.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-primary mb-2">
                  Account Details
                </h3>
                <FormField
                  control={form.control}
                  name="tenure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenure (Months)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyCharges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Charges ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalCharges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Charges ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(CustomerInputContract).map((val) => (
                            <SelectItem key={val} value={val}>
                              {val}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(CustomerInputPaymentMethod).map(
                            (val) => (
                              <SelectItem key={val} value={val}>
                                {val}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paperlessBilling"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paperless Billing</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Services */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-primary mb-2">
                  Services
                </h3>
                <FormField
                  control={form.control}
                  name="internetService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internet Service</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(CustomerInputInternetService).map(
                            (val) => (
                              <SelectItem key={val} value={val}>
                                {val}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Service</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="multipleLines"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Multiple Lines</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(CustomerInputMultipleLines).map(
                            (val) => (
                              <SelectItem key={val} value={val}>
                                {val}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="onlineSecurity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Online Security</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(CustomerInputOnlineSecurity).map(
                            (val) => (
                              <SelectItem key={val} value={val}>
                                {val}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="techSupport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tech Support</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(CustomerInputTechSupport).map(
                            (val) => (
                              <SelectItem key={val} value={val}>
                                {val}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deviceProtection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Protection</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(CustomerInputDeviceProtection).map(
                            (val) => (
                              <SelectItem key={val} value={val}>
                                {val}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Demographics & Media */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-primary mb-2">
                  Demographics & Media
                </h3>
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seniorCitizen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senior Citizen</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dependents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dependents</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="streamingTV"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Streaming TV</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(CustomerInputStreamingTV).map(
                            (val) => (
                              <SelectItem key={val} value={val}>
                                {val}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="streamingMovies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Streaming Movies</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(CustomerInputStreamingMovies).map(
                            (val) => (
                              <SelectItem key={val} value={val}>
                                {val}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={predictMutation.isPending}
                className="px-8 font-semibold"
              >
                {predictMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Prediction
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
