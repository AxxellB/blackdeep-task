import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  Heading,
  useToast,
  Flex,
  Text,
  Progress,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Step1Form from "./partials/Step1Form";
import { registrationFormSchema } from "./partials/Step1Form";

import Step2Form, { step2FormSchema } from "./partials/Step2Form";

const combinedFormSchema = registrationFormSchema.and(step2FormSchema);

export type CombinedFormData = z.infer<typeof combinedFormSchema>;

interface Interest {
  id: string;
  name: string;
}

const fetchInterests = async (): Promise<Interest[]> => {
  try {
    const response = await fetch("http://localhost:3001/interests");
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error("Failed to fetch interests");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching interests:", error);
    return [];
  }
};

const submitRegistration = async (data: CombinedFormData) => {
  let avatarBase64: string | null = null;

  if (data.avatar && data.avatar.length > 0) {
    const file = data.avatar[0];
    try {
      avatarBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("Error reading avatar file:", error);
      avatarBase64 = null;
    }
  }

  try {
    const payload = {
      names: data.names,
      password: data.password,
      confirmPassword: data.confirmPassword,
      interests: data.interests,
      avatar: avatarBase64,
    };

    const response = await fetch("http://localhost:3001/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error(`Submission HTTP error! status: ${response.status}`);
      throw new Error("Form submission failed");
    }
    return response.json();
  } catch (error) {
    console.error("Error submitting registration:", error);
    throw error;
  }
};

const RegistrationForm = () => {
  const toast = useToast();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const formMethods = useForm<CombinedFormData>({
    resolver: zodResolver(combinedFormSchema),
    defaultValues: {
      names: "",
      password: "",
      confirmPassword: "",
      interests: [],
      avatar: undefined,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const {
    handleSubmit,
    trigger,
    formState: { isSubmitting, errors },
    reset,
  } = formMethods;

  useEffect(() => {
    const loadInterests = async () => {
      const fetchedInterests = await fetchInterests();
      setInterests(fetchedInterests);
    };
    loadInterests();
  }, []);

  const handleNext = async () => {
    let fieldsToValidate: (keyof CombinedFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["names", "password", "confirmPassword", "interests"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["avatar"];
    }

    const isStepValid = await trigger(fieldsToValidate, { shouldFocus: true });

    if (isStepValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      const firstErrorField = fieldsToValidate.find((field) => errors[field]);
      if (firstErrorField) {
        console.log(
          `Validation failed for step ${currentStep}. First error on field:`,
          firstErrorField,
          errors[firstErrorField]?.message
        );
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: CombinedFormData) => {
    try {
      await submitRegistration(data);
      toast({
        title: "Registration successful",
        description: "You have registered successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      reset();
      setCurrentStep(1);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An error occurred during registration. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Form form={formMethods} interests={interests} />;
      case 2:
        return (
          <Step2Form
            form={formMethods}
            avatarPreview={avatarPreview}
            setAvatarPreview={setAvatarPreview}
          />
        );
      default:
        return null;
    }
  };

  const progressValue = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <Box
      maxW="md"
      mx="auto"
      mt={10}
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="lg"
      bg="white"
    >
      <Heading mb={6} textAlign="center" size="lg" color="teal.600">
        Register
      </Heading>

      <VStack spacing={4} mb={6}>
        <Flex width="full" justifyContent="space-between" alignItems="center">
          <Text fontSize="sm" color="gray.600">
            Step {currentStep} of {totalSteps}
          </Text>
          <Progress
            value={progressValue}
            width="full"
            mx={2}
            colorScheme="teal"
            size="sm"
            borderRadius="md"
          />
        </Flex>
      </VStack>

      <form onSubmit={handleSubmit(onSubmit)}>
        {renderStep()}

        <VStack spacing={4} mt={6}>
          {currentStep > 1 && (
            <Button
              onClick={handleBack}
              isDisabled={isSubmitting}
              width="full"
              variant="outline"
              colorScheme="teal"
            >
              Back
            </Button>
          )}

          {currentStep < totalSteps && (
            <Button
              onClick={handleNext}
              isDisabled={isSubmitting}
              width="full"
              colorScheme="teal"
            >
              Next
            </Button>
          )}

          {currentStep === totalSteps && (
            <Button
              type="submit"
              colorScheme="teal"
              width="full"
              isLoading={isSubmitting}
            >
              Register
            </Button>
          )}
        </VStack>
      </form>
    </Box>
  );
};

export default RegistrationForm;
