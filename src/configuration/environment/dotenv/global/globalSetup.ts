import { EnvironmentLoader } from "./environmentLoader";
import ErrorHandler from "../../../../utils/errorHandling/errorHandler";

async function globalSetup(): Promise<void> {
  try {
    const environmentLoader = new EnvironmentLoader();
    await environmentLoader.initialize();
  } catch (error) {
    ErrorHandler.captureError(
      error,
      "globalSetup",
      "Failed to set up global environment variables",
    );
    throw error;
  }
}

export default globalSetup;
