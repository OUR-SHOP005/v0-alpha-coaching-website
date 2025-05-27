"use client"

import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Button } from "./button"
import { toast } from "react-hot-toast"

interface ImageUploadProps {
    onChange: (value: string) => void
    onRemove: () => void
    value: string
    disabled?: boolean
}

export function ImageUpload({
    onChange,
    onRemove,
    value,
    disabled
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("File too large (max 5MB)")
            return
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError("Only image files are allowed")
            return
        }

        try {
            setIsUploading(true)
            setError(null)

            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                toast.error("Upload failed")
            }

            const data = await response.json()
            onChange(data.url)
        } catch (error) {
            console.error("Error uploading image:", error)
            setError("Upload failed, please try again")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center gap-4">
                {value && !isUploading ? (
                    <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
                        <div className="absolute top-2 right-2 z-10">
                            <Button
                                type="button"
                                onClick={onRemove}
                                variant="destructive"
                                size="icon"
                                disabled={disabled}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image
                            fill
                            src={value}
                            alt="Uploaded image"
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div
                        className="relative border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col justify-center items-center w-full h-[200px] cursor-pointer hover:border-gray-400 transition"
                        onClick={() => {
                            if (isUploading || disabled) return
                            document.getElementById('image-upload')?.click()
                        }}
                    >
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            className="sr-only"
                            disabled={disabled || isUploading}
                        />
                        {isUploading ? (
                            <div className="flex flex-col items-center justify-center text-center">
                                <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-2" />
                                <p className="text-sm text-gray-500">Uploading...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center">
                                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                <p className="text-sm font-medium">Click to upload</p>
                                <span className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 5MB</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    )
} 