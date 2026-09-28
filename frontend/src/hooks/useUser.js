import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { userService } from "../services";
import { QK } from "../constants/queryKeys";

export function useUserList() {
  return useQuery({ queryKey: QK.user.list, queryFn: userService.list });
}

export function useUser(id) {
  return useQuery({
    queryKey: QK.user.detail(id),
    queryFn: () => userService.get(id),
    enabled: Boolean(id),
  });
}

export function useUserMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["user"] });

  return {
    create: useMutation({ mutationFn: userService.create, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, body }) => userService.update(id, body),
      onSuccess: invalidate,
    }),
    setStatus: useMutation({
      mutationFn: ({ id, status }) => userService.setStatus(id, status),
      onSuccess: invalidate,
    }),
    resetPassword: useMutation({
      mutationFn: ({ id, password }) => userService.resetPassword(id, password),
    }),
    remove: useMutation({ mutationFn: userService.remove, onSuccess: invalidate }),
  };
}
