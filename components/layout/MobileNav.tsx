"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "@/components/layout/SidebarNav";

/**
 * Navegação para telas abaixo de `lg`: um botão "hambúrguer" na topbar que
 * abre um drawer lateral com a mesma navegação da sidebar. Fecha ao tocar
 * num item (via onNavigate) ou no overlay/X.
 */
export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Abrir menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-content-muted transition-colors hover:text-content lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-fade-in lg:hidden" />
        <DialogPrimitive.Content
          className="fixed left-0 top-0 z-50 h-full w-72 border-r border-white/[0.06] bg-background/95 backdrop-blur-xl shadow-card focus:outline-none data-[state=open]:animate-fade-in lg:hidden"
        >
          <DialogPrimitive.Title className="sr-only">
            Navegação
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            className="absolute right-3 top-4 rounded-lg p-1 text-content-muted transition-colors hover:bg-white/[0.06] hover:text-content focus:outline-none"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
