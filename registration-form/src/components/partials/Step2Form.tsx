import React, { useEffect } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  VStack,
  Box,
  Image,
} from "@chakra-ui/react";
import { UseFormReturn, FieldError } from "react-hook-form";
import { z } from "zod";
import { CombinedFormData } from "../RegisterForm";

export const step2FormSchema = z.object({
  avatar: z
    .any()
    .refine((files) => files?.length === 1, "Avatar image is required.")
    .refine(
      (files) => files?.[0]?.size <= 5 * 1024 * 1024,
      "Avatar image must be less than 5MB."
    )
    .refine(
      (files) =>
        ["image/jpeg", "image/png", "image/webp"].includes(files?.[0]?.type),
      "Only .jpg, .png, and .webp formats are supported."
    ),
});

export type Step2FormData = z.infer<typeof step2FormSchema>;

interface Step2FormProps {
  form: UseFormReturn<CombinedFormData, any>;
  avatarPreview: string | null;
  setAvatarPreview: (url: string | null) => void;
}

const Step2Form: React.FC<Step2FormProps> = ({
  form,
  avatarPreview,
  setAvatarPreview,
}) => {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const watchedAvatar = watch("avatar");

  useEffect(() => {
    if (watchedAvatar && watchedAvatar[0]) {
      const file = watchedAvatar[0];
      setAvatarPreview(URL.createObjectURL(file));
      return () => {
        if (avatarPreview) {
          URL.revokeObjectURL(avatarPreview);
        }
      };
    } else {
      setAvatarPreview(null);
    }
  }, [watchedAvatar, avatarPreview, setAvatarPreview]);

  const avatarErrorMessage = (errors.avatar as FieldError)?.message;

  return (
    <VStack spacing={4}>
      <FormControl isInvalid={!!errors.avatar}>
        <FormLabel htmlFor="avatar">Upload Avatar</FormLabel>
        <Input
          id="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          {...register("avatar")}
          p={1}
        />
        {avatarErrorMessage && (
          <FormErrorMessage>{avatarErrorMessage}</FormErrorMessage>
        )}
        {avatarPreview && (
          <Box mt={4} textAlign="center">
            <Image
              src={avatarPreview}
              alt="Avatar Preview"
              boxSize="150px"
              objectFit="cover"
              borderRadius="full"
              mx="auto"
            />
          </Box>
        )}
      </FormControl>
    </VStack>
  );
};

export default Step2Form;
