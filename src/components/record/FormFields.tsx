"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

type Props = {
  fields: { key: string; value: string }[];
  form: any;
};

export function FormFields({ fields, form }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <AnimatePresence mode="popLayout">
        {fields.map(({ key }, index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              delay: index * 0.1,
            }}
          >
            <FormField
              control={form.control}
              name={`content.${key}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{key}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      {fields.length === 0 && (
        <motion.p
          className="text-sm text-muted-foreground col-span-2 text-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          写真をアップロードすると、おみくじの内容が自動で読み取られます
        </motion.p>
      )}
    </div>
  );
}
