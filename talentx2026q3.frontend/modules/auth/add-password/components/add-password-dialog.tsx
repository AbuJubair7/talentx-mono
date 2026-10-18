"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddPasswordForm } from "./add-password-form";

export interface AddPasswordDialogProps {
  onPasswordAdded?: () => void;
}

export function AddPasswordDialog({ onPasswordAdded }: AddPasswordDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent transition-colors">
        Add Password
      </DialogTrigger>

      <DialogContent className="max-w-md p-0 max-h-[90vh] overflow-y-auto gap-0 [&>button]:z-10">
        <DialogTitle className="sr-only">Add Password</DialogTitle>
        <AddPasswordForm
          onSuccess={() => {
            setIsOpen(false);
            onPasswordAdded?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
