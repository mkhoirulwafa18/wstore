"use client";

import * as z from 'zod';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Size } from "@prisma/client";
import { TrashIcon } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import { AlertModal } from '@/components/modals/alert-modal';

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(1)
});

type ColorFormValues = z.infer<typeof formSchema>;

interface ColorFormProps {
    initialData: Size | null;
}

export const ColorForm: React.FC<ColorFormProps> = ({
    initialData
}) => {

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const router = useRouter();

    const title = initialData ? "Edit color" : "Create color"
    const description = initialData ? "Edit a color" : "Add a new color"
    const toastMessage = initialData ? "Color updated successfully!" : "Color created successfully!"
    const action = initialData ? "Save Changes" : "Create"

    const form = useForm<ColorFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            value: ''
        }
    })

    const onSubmit = async (data: ColorFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/colors/${params.colorId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/colors`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/colors`)
            toast.success(toastMessage);
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false);
        }
    }
    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`);
            router.refresh();
            router.push(`/${params.storeId}/colors`)
            toast.success('Color successfully deleted!');
        } catch (error) {
            toast.error('Make sure you delete all product using this color in store first.')
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }

    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                loading={loading}
                onConfirm={onDelete}
            />
            <div className="flex items-center justify-between mb-4">
                <Heading
                    title={title}
                    description={description}
                />
                {
                    initialData && (
                        <Button disabled={loading} variant='destructive' size='sm' onClick={() => { setOpen(true) }}>
                            <TrashIcon className="h-4 w-4" />
                        </Button>
                    )
                }
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 w-full'>
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder='Color name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='value'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Value</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder='Color value' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled={loading} type='submit'>
                        {action}
                    </Button>
                </form>
            </Form>
        </>
    )
}