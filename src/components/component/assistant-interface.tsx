import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal, ArrowLeft, Image, Paperclip, X, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from '@/lib/utils';
import Link from "next/link";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface AssistantType {
    id: string;
    name: string;
}

interface VectorStoreType {
    id: string;
    name: string;
}

interface ComboBoxOption {
    value: string;
    label: string;
}

export default function AssistantInterface() {
    const API_ENDPOINT_URL = process.env.NEXT_PUBLIC_MS;

    const [messages, setMessages] = useState([{ role: 'assistant', content: '¡Hola! ¿En qué puedo ayudarte hoy?' }]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [thread, setThread] = useState<string | null>(null);
    const [isThreadCreated, setIsThreadCreated] = useState(false);
    const [assistants, setAssistants] = useState<ComboBoxOption[] | null>(null);
    const [vectorStores, setVectorStores] = useState<ComboBoxOption[] | null>(null);
    const [openAssistant, setOpenAssistant] = useState(false);
    const [valueAssistant, setValueAssistant] = useState("");
    const [openVector, setOpenVector] = useState(false);
    const [valueVector, setValueVector] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const fetchInitialBoxData = async () => {
            try {
                const [responseAssistant, responseVectorStores] = await Promise.all([
                    fetch(`${API_ENDPOINT_URL}/list-assistants`, { method: 'GET', headers: { 'Content-Type': 'application/json' }}),
                    fetch(`${API_ENDPOINT_URL}/list-vector-stores`, { method: 'GET', headers: { 'Content-Type': 'application/json' }})
                ]);

                if (!responseAssistant.ok) throw new Error('Error al obtener los asistentes');
                if (!responseVectorStores.ok) throw new Error('Error al obtener los vectores');

                const resultAssistant = await responseAssistant.json();
                const resultVectorStores = await responseVectorStores.json();

                const formatAssistantsForComboBox = (assistants: AssistantType[]) => 
                    assistants.map(assistant => ({ value: assistant.id, label: assistant.name || 'Sin Nombre' }));
                const formatVectorStoresForComboBox = (vectorStores: VectorStoreType[]) => 
                    vectorStores.map(vectorStore => ({ value: vectorStore.id, label: vectorStore.name || 'Sin Nombre' }));

                setAssistants(formatAssistantsForComboBox(resultAssistant.assistants || []));
                setVectorStores(formatVectorStoresForComboBox(resultVectorStores.vector_stores || []));
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchInitialBoxData();
    }, []);

    useEffect(() => {
        const newThread = async () => {
            try {
                const response = await fetch(`${API_ENDPOINT_URL}/create-thread`, { method: 'POST', headers: { 'Content-Type': 'application/json' }});
                if (!response.ok) throw new Error ('Error al crear el Thread');
                const result = await response.json();
                setThread(result.thread_id);
                setIsThreadCreated(true);
            } catch (error) {
                console.error('error:', error);
                throw error;
            }
        };
        if (!isThreadCreated && thread === null) newThread();
    }, [isThreadCreated, thread]);

    useEffect(() => {
        if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSend = async () => {
        if (input.trim() || selectedFile) {
            const newMessage = { role: 'user', content: input, file: selectedFile };
            setMessages([...messages, newMessage]);
            setInput('');
            setSelectedFile(null);
            setIsLoading(true);

            try {
                const response = await fetch(`${API_ENDPOINT_URL}/ask/assistant`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        thread_id: thread,
                        query: newMessage.content,
                        assistant_id: valueAssistant,
                        vector_store_id: valueVector
                    }),
                });
                const result = await response.json();
                setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: result.response }]);
            } catch (error) {
                console.error('Error in API call:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleBack = () => {
        setThread(null);
        setIsThreadCreated(false);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    if (isDataLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-100">
                <Loader2 className="h-12 w-12 animate-spin" />
                <p className="ml-4">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
            <div className="bg-gray-800 p-4 flex justify-between items-center">
                <img src="/iatic_logo.svg?height=40&width=160" alt="Company Logo" className="h-10 w-30" />
                <div className="flex items-center">
                    <Popover open={openAssistant} onOpenChange={setOpenAssistant}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={openAssistant} className="w-[200px] justify-between">
                                {valueAssistant ? assistants?.find(assistant => assistant.value === valueAssistant)?.label : "Select assistant..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandList>
                                    <CommandEmpty>No assistant found.</CommandEmpty>
                                    <CommandGroup>
                                        {assistants?.map(assistant => (
                                            <CommandItem key={assistant.value} value={assistant.value} onSelect={() => setValueAssistant(assistant.value)}>
                                                <Check className={cn("mr-2 h-4 w-4", valueAssistant === assistant.value ? "opacity-100" : "opacity-0")} />
                                                {assistant.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <Popover open={openVector} onOpenChange={setOpenVector}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={openVector} className="w-[200px] justify-between">
                                {valueVector ? vectorStores?.find(vectorStore => vectorStore.value === valueVector)?.label : "Select vectorStore..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandList>
                                    <CommandEmpty>No vectorStore found.</CommandEmpty>
                                    <CommandGroup>
                                        {vectorStores?.map(vectorStore => (
                                            <CommandItem key={vectorStore.value} value={vectorStore.value} onSelect={() => setValueVector(vectorStore.value)}>
                                                <Check className={cn("mr-2 h-4 w-4", valueVector === vectorStore.value ? "opacity-100" : "opacity-0")} />
                                                {vectorStore.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            {/* Your main content */}
        </div>
    );
}
