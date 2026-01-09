"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Lock, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Sub-component for rendering individual fields within an array item
function ArrayItemField({ field, value, onChange }) {
  switch (field.type) {
    case "text":
    case "email":
    case "tel":
    case "number":
      return (
        <div className="space-y-1">
          <Label htmlFor={field.id} className="text-xs font-medium text-gray-600">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={field.id}
            type={field.type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="h-9 text-sm border-gray-300 focus:border-red-500 focus:ring-red-500"
          />
        </div>
      )

    case "textarea":
      return (
        <div className="space-y-1">
          <Label htmlFor={field.id} className="text-xs font-medium text-gray-600">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            id={field.id}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 2}
            className="text-sm border-gray-300 focus:border-red-500 focus:ring-red-500 resize-none"
          />
        </div>
      )

    case "select":
      return (
        <div className="space-y-1">
          <Label htmlFor={field.id} className="text-xs font-medium text-gray-600">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-red-500 focus:ring-red-500">
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

    default:
      return null
  }
}

// Component for rendering a single array item with all its fields
function ArrayItem({ item, index, fields, onChange, onRemove, isExpanded, onToggleExpand }) {
  const handleFieldChange = (fieldId, value) => {
    onChange({
      ...item,
      [fieldId]: value,
    })
  }

  // Get a summary of the item for collapsed view
  const getItemSummary = () => {
    const descField = fields.find(f => f.id.toLowerCase().includes('description') || f.id.toLowerCase().includes('name'))
    const description = descField ? item[descField.id] : null
    return description || `Item ${index + 1}`
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      {/* Item Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center space-x-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold shadow-sm">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
            {getItemSummary()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Item Fields - Collapsible */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div 
                key={field.id} 
                className={field.type === "textarea" ? "md:col-span-2" : ""}
              >
                <ArrayItemField
                  field={field}
                  value={item[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Main component for array/repeatable fields
function ArrayField({ field, value, onChange }) {
  const [expandedItems, setExpandedItems] = useState(new Set([0])) // First item expanded by default
  
  // Ensure value is always an array
  const items = Array.isArray(value) ? value : []

  const handleAddItem = () => {
    const newItem = {}
    // Initialize with empty values for all sub-fields
    field.itemFields?.forEach((subField) => {
      newItem[subField.id] = ""
    })
    const newItems = [...items, newItem]
    onChange(newItems)
    // Expand the new item
    setExpandedItems(new Set([...expandedItems, newItems.length - 1]))
  }

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
    // Update expanded items indices
    const newExpanded = new Set()
    expandedItems.forEach(i => {
      if (i < index) newExpanded.add(i)
      else if (i > index) newExpanded.add(i - 1)
    })
    setExpandedItems(newExpanded)
  }

  const handleItemChange = (index, newItem) => {
    const newItems = [...items]
    newItems[index] = newItem
    onChange(newItems)
  }

  const toggleExpand = (index) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-semibold text-gray-700 flex items-center">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.description && (
            <p className="text-xs text-gray-500 mt-1">{field.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <ArrayItem
            key={index}
            item={item}
            index={index}
            fields={field.itemFields || []}
            onChange={(newItem) => handleItemChange(index, newItem)}
            onRemove={() => handleRemoveItem(index)}
            isExpanded={expandedItems.has(index)}
            onToggleExpand={() => toggleExpand(index)}
          />
        ))}
      </div>

      {/* Add Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddItem}
        className="w-full border-dashed border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all duration-200"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add {field.itemLabel || 'Item'}
      </Button>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-gray-400 mb-2">
            <Plus className="h-8 w-8 mx-auto" />
          </div>
          <p className="text-sm text-gray-500">
            No {field.itemLabelPlural || 'items'} added yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Click the button above to add your first {field.itemLabel || 'item'}
          </p>
        </div>
      )}
    </div>
  )
}

export function FormField({ field, value, onChange }) {
  switch (field.type) {
    case "text":
    case "email":
    case "tel":
    case "number":
    case "datetime-local":
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

    // NEW: Array/Repeatable field type
    case "array":
      return <ArrayField field={field} value={value} onChange={onChange} />

    default:
      return null
  }
}