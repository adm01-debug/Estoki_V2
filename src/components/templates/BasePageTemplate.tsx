import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

interface BasePageTemplateProps {
  children: ReactNode;
  title?: string;
  description?: string;
  headerActions?: ReactNode;
  className?: string;
  showBreadcrumbs?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

/**
 * BasePageTemplate
 * Standard layout for most app pages, ensuring consistent spacing and entry animations.
 */
export const BasePageTemplate = ({
  children,
  title,
  description,
  headerActions,
  className,
  showBreadcrumbs = true,
  maxWidth = "xl"
}: BasePageTemplateProps) => {
  
  const maxWidthClass = {
    sm: "max-w-4xl",
    md: "max-w-5xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-none"
  }[maxWidth];

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {showBreadcrumbs && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Breadcrumbs className="mb-2" />
        </motion.div>
      )}

      {(title || headerActions) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {title && (
              <h1 className="text-3xl font-black tracking-tight text-foreground gradient-text">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-muted-foreground text-sm mt-1 max-w-2xl font-medium">
                {description}
              </p>
            )}
          </motion.div>
          
          {headerActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              {headerActions}
            </motion.div>
          )}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={cn("w-full mx-auto", maxWidthClass)}
      >
        {children}
      </motion.div>
    </div>
  );
};