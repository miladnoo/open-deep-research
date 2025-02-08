'use server';

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export interface RegisterActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'user_exists' | 'invalid_data';
}

// Auth disabled - always return success
export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  return { status: 'success' };
};

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  return { status: 'success' };
};
