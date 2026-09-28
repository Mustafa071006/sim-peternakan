import { useMutation } from "@tanstack/react-query";

import { authService } from "../services";
import { useAuth } from "../contexts";
import { getErrorMessage } from "../lib/http";

/**
 * Login mutation wired to the AuthContext. On success the token + user are
 * persisted and the caller can redirect based on `data.user.role`.
 */
export function useLoginMutation() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: ({ token, user }) => {
      if (token && user) login(token, user);
    },
    meta: { getErrorMessage },
  });
}
