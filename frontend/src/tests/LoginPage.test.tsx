import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import { Controller, FormProvider, useFormContext } from "react-hook-form"
import { cn } from "../../lib/cn"

// Re-export FormProvider as Form so consumers can do: <Form {...form}>
export const Form = FormProvider

export type FormFieldContextValue = {
  name: string
}

const FormFieldContext = React.createContext<FormFieldContextValue>({
  name: "",
})

export function FormField<TFieldValues extends Record<string, any>, TName extends string>(
  props: {
    name: TName
    control?: any
    render: (props: {
      field: any
      fieldState: any
      formState: any
    }) => React.ReactNode
  }
) {
  const { name, control, render } = props as any
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller name={name} control={control || useFormContext().control} render={render} />
    </FormFieldContext.Provider>
  )
}

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const id = itemContext.id

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

const FormItemContext = React.createContext<{ id: string }>({ id: "" })

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
}

export function FormLabel({ className, ...props }: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) {
  const { formItemId } = useFormField()

  return (
    <LabelPrimitive.Root htmlFor={formItemId} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
  )
}

export function FormControl({ ...props }: React.ComponentPropsWithoutRef<typeof Slot>) {
  const { formItemId } = useFormField()
  return <Slot id={formItemId} {...props} />
}

export function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { formDescriptionId } = useFormField()
  return <p id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { formMessageId } = useFormField()
  const { error } = useFormField()
  const body = error ? String(error?.message ?? children) : children
  if (!body) return null
  return (
    <p id={formMessageId} className={cn("text-sm font-medium text-destructive", className)} {...props}>
      {body}
    </p>
  )
}
