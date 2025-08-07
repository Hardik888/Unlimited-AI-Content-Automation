import { handler as mainHandler } from "./handlers/main";
import { handler as workerHandler } from "./handlers/worker";

export const bootstrap = () => {
   // Usually I would use a DI container here, but for the sake of simplicity, I'm just returning the handlers
   return {
        handlers: {
           initiateSync: mainHandler,
           processPost: workerHandler,
        }
    };
};
