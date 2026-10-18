"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminAccountStatus } from "../types/user";

interface UserStatusConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  newStatus: AdminAccountStatus;
  isPending: boolean;
  onConfirm: () => void;
}

export function UserStatusConfirmDialog({
  open,
  onOpenChange,
  userName,
  newStatus,
  isPending,
  onConfirm,
}: UserStatusConfirmDialogProps) {
  const isDeactivating = newStatus === "Deactivated";
  const title = isDeactivating ? "Deactivate Account" : "Activate Account";
  const description = isDeactivating
    ? `This marks "${userName}"'s account as deactivated. Are you sure?`
    : `This marks "${userName}"'s account as active again. Are you sure?`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="flex justify-end gap-2 pt-2">
          <DialogClose
            render={
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className={
              isDeactivating
                ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            }
          >
            {title}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
