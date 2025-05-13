import { z } from 'zod';
import { User } from '../generated/prisma';
import { getUser } from '../users';


export type ActionState = {
  error?: string;
  success?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};


function handleValidation<S extends z.ZodTypeAny>(
    schema: S,
    formData: FormData
): { success: true; data: z.infer<S> } | { success: false; error: string } {
    const data = Object.fromEntries(formData.entries());
    const result = schema.safeParse(data);
  
    if (!result.success) {
      const error = result.error.errors[0]?.message ?? "Invalid input";
      return { success: false, error };
    }
  
    return { success: true, data: result.data };
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validatedActionFactory<S extends z.ZodType<any, any>, T>(
    schema: S,
    action: ValidatedActionFunction<S, T>
) {
    async function validatedActionHandler(
      _prevState: unknown,
      formData: FormData
    ): Promise<T> {
      const validation = handleValidation(schema, formData);
      if (!validation.success) {
        return { error: validation.error } as T;
      }
  
      return action(validation.data, formData);
    }
  
    return validatedActionHandler;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validatedActionWithUserFactory<S extends z.ZodType<any, any>, T>(
    schema: S,
    action: ValidatedActionWithUserFunction<S, T>
) {
    async function validatedActionWithUserHandler(
      _prevState: unknown,
      formData: FormData
    ): Promise<T> {
      const user = await getUser();
      if (!user) throw new Error("User is not authenticated");

      const validation = handleValidation(schema, formData);
      if (!validation.success) {
        return { error: validation.error } as T;
      }

      return action(validation.data, formData, user);
    }

    return validatedActionWithUserHandler;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validatedServerFunctionWithUser<S extends z.ZodType<any, any>, T>(
    schema: S,
    action: (input: z.infer<S>, user: User) => Promise<T>
) {
    async function validatedServerFunctionHandler(input: unknown): Promise<T> {
      const user = await getUser();
      if (!user) {
        throw new Error("User is not authenticated");
      }

      const parsed = schema.safeParse(input);
      if (!parsed.success) {
        return { error: parsed.error.format?.() ?? parsed.error } as T;
      }

      return action(parsed.data, user);
    }

    return validatedServerFunctionHandler;
}