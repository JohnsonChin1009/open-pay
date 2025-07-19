import { Message } from "@/lib/types";

export const onboardingMessages: Message[] = [
  {
    role: "system",
    message: "Hey there! 👋 Welcome to OpenPay. Before we get started, let’s verify your identity real quick — just to keep things safe and secure 🔒",
  },
  {
    role: "system",
    message: "Could you please upload a photo of your IC for eKYC? Don’t worry, your info stays private and secure 💼",
  },
  {
    role: "system",
    message: "Lastly, we’ll need your SSM number and a few business details that only the real owner would know — just to confirm it’s really you 😊",
  }
];
