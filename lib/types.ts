type Message = {
  role: "user" | "system";
  message: string;
  fileName?: string;
  fileURL?: string;
};

export type { Message };

