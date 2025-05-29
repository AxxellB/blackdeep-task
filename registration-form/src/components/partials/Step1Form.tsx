import React from "react";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  VStack,
  CheckboxGroup,
  Checkbox,
  Stack,
} from "@chakra-ui/react";
import { UseFormReturn, Controller } from "react-hook-form";
import { z } from "zod";

export const registrationFormSchema = z
  .object({
    names: z.string().min(2, "Name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    interests: z
      .array(z.string())
      .min(1, "Please select at least one interest")
      .max(2, "You can select a maximum of 2 interests"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegistrationFormData = z.infer<typeof registrationFormSchema>;

interface Step1FormProps {
  form: UseFormReturn<RegistrationFormData, any>;
  interests: { id: string; name: string }[];
}

const Step1Form: React.FC<Step1FormProps> = ({ form, interests }) => {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const errorMessageMaxWidth = "160px";

  return (
    <VStack spacing={4}>
      <FormControl isInvalid={!!errors.names}>
        <FormLabel htmlFor="names">Names</FormLabel>
        <Input id="names" {...register("names")} size="md" />
        <FormErrorMessage maxW={errorMessageMaxWidth}>
          {errors.names?.message ?? ""}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.password}>
        <FormLabel htmlFor="password">Password</FormLabel>
        <Input
          id="password"
          type="password"
          {...register("password")}
          size="md"
        />
        <FormErrorMessage maxW={errorMessageMaxWidth}>
          {errors.password?.message ?? ""}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.confirmPassword}>
        <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          size="md"
        />
        <FormErrorMessage maxW={errorMessageMaxWidth}>
          {errors.confirmPassword?.message ?? ""}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.interests}>
        <FormLabel htmlFor="interests">Interests (Max 2)</FormLabel>
        <Controller
          name="interests"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CheckboxGroup value={value} onChange={onChange}>
              <Stack direction="column" spacing={2}>
                {interests.map((interest) => (
                  <Checkbox key={interest.id} value={interest.id}>
                    {interest.name}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
          )}
        />
        <FormErrorMessage maxW="120px">
          {errors.interests?.message ?? ""}
        </FormErrorMessage>
      </FormControl>
    </VStack>
  );
};

export default Step1Form;
