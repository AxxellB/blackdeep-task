import React, { useState, useEffect } from "react";
import { Box, Button, VStack, Heading, useToast } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Step1Form, {
  registrationFormSchema,
  RegistrationFormData,
} from "./partials/Step1Form";

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

const submitRegistration = async (data: RegistrationFormData) => {
  try {
    const response = await fetch("http://localhost:3001/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        names: data.names,
        interests: data.interests,
      }),
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

  const formMethods = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      names: "",
      password: "",
      confirmPassword: "",
      interests: [],
    },
    mode: "onBlur",
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = formMethods;

  useEffect(() => {
    const loadInterests = async () => {
      const fetchedInterests = await fetchInterests();
      setInterests(fetchedInterests);
    };
    loadInterests();
  }, []);

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      await submitRegistration(data);
      toast({
        title: "Registration successful",
        description: "You have registered successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      formMethods.reset();
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <Step1Form form={formMethods} interests={interests} />

        <VStack spacing={4} mt={6}>
          <Button
            type="submit"
            colorScheme="teal"
            width="full"
            isLoading={isSubmitting}
            size="lg"
          >
            Register
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default RegistrationForm;
