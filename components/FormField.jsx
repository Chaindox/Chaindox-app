"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Lock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function FormField({ field, value, onChange }) {
  switch (field.type) {
    case "text":
    case "email":
    case "tel":
    case "number":
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id} className="text-sm font-semibold text-gray-700 flex items-center">
            {field.label} 
            {field.required && <span className="text-red-500 ml-1">*</span>}
            {field.readonly && <Lock className="inline w-3 h-3 ml-2 text-gray-400" />}
            {field.computed && <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Auto</span>}
          </Label>
          <Input
            id={field.id}
            type={field.type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            readOnly={field.readonly}
            className={cn(
              "transition-all duration-200 border-gray-300 focus:border-red-500 focus:ring-red-500",
              field.readonly && "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 cursor-not-allowed border-gray-200 font-semibold"
            )}
          />
        </div>
      )

    case "textarea":
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id} className="text-sm font-semibold text-gray-700 flex items-center">
            {field.label} 
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            id={field.id}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            className="transition-all duration-200 border-gray-300 focus:border-red-500 focus:ring-red-500 resize-none"
          />
        </div>
      )

    case "select":
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id} className="text-sm font-semibold text-gray-700 flex items-center">
            {field.label} 
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case "date":
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id} className="text-sm font-semibold text-gray-700 flex items-center">
            {field.label} 
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-gray-300 hover:bg-gray-50 transition-all duration-200",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={value ? new Date(value) : undefined} onSelect={onChange} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      )

    case "checkbox":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox id={field.id} checked={value || field.defaultValue || false} onCheckedChange={onChange} />
          <Label htmlFor={field.id}>{field.label}</Label>
        </div>
      )

    case "radio":
      return (
        <div>
          <Label className="text-base font-medium">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </Label>
          <RadioGroup value={value || ""} onValueChange={onChange} className="mt-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )

    default:
      return null
  }
}
