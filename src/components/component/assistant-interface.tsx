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
import { AnyARecord } from 'dns';

interface assistantType {
  id: String,
  name: String
}

interface vectorStoreType {
  id: String,
  name: String
}

export default function AssistantInterface() {
    const frameworks = [
        {
          value: "next.js",
          label: "Next.js",
        },
        {
          value: "sveltekit",
          label: "SvelteKit",
        },
        {
          value: "nuxt.js",
          label: "Nuxt.js",
        },
        {
          value: "remix",
          label: "Remix",
        },
        {
          value: "astro",
          label: "Astro",
        },
      ]
  const API_ENDPOINT_URL = process.env.NEXT_PUBLIC_MS;
  const [messages, setMessages] = useState([{ role: 'assistant', content: '¡Hola! ¿En qué puedo ayudarte hoy?' }]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [thread, setThread] = useState(null);
  const [isThreadCreated, setIsThreadCreated] = useState(false);
  const [assistants, setAssistants] = useState(null);
  const [vectorStores, setVectorStores] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const textareaRef = useRef(null);
  const [openAssistant, setOpenAssistant] = useState(false);
  const [valueAssistant, setValueAssistant] = useState("");
  const [openVector, setOpenVector] = useState(false);
  const [valueVector, setValueVector] = useState("");

  useEffect(() => {
    const fetchInitialBoxData = async () => {
        try {
            const [responseAssistant, responseVectorStores] = await Promise.all([
                fetch(`${API_ENDPOINT_URL}/list-assistants`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(`${API_ENDPOINT_URL}/list-vector-stores`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }),
            ]);

            if (!responseAssistant.ok) {
                throw new Error('Error al obtener los asistentes');
            }
            if (!responseVectorStores.ok) {
                throw new Error('Error al obtener los vectores');
            }

            const resultAssistant = await responseAssistant.json();
            const resultVectorStores = await responseVectorStores.json();

            const formatAssistantsForComboBox = (assistants: assistantType[]) => {
                return assistants.map(assistant => ({
                    value: assistant.id,
                    label: assistant.name || 'Sin Nombre',
                }));
            };

            const formatVectorStoresForComboBox = (vectorStores: vectorStoreType[]) => {
                return vectorStores.map(vectorStore => ({
                    value: vectorStore.id,
                    label: vectorStore.name || 'Sin Nombre',
                }));
            };

            const assisstantsArray = resultAssistant.assistants || [];
            setAssistants(formatAssistantsForComboBox(assisstantsArray));
            
            const vectorStoresArray = resultVectorStores.vector_stores || [];
            setVectorStores(formatAssistantsForComboBox(vectorStoresArray));
            

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsDataLoading(false);
        }
    };

    fetchInitialBoxData();
}, []);

console.log(assistants)
console.log(vectorStores)




  useEffect(() => {
    const newThread = async () => {
      try {
        const response = await fetch(`${API_ENDPOINT_URL}/create-thread`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
      });
        if (!response.ok) {
          throw new Error ('Error al crear el Thread')
        }
        const result = await response.json();
        setThread(result.thread_id);
        setIsThreadCreated(true);
      } catch (error) {
        console.error('error:', error);
        throw error;
      }
    };
    if (!isThreadCreated && thread === null){
      newThread();
    }
  }, [isThreadCreated, thread]);

  //console.log(thread)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSend = async () => {
    if (input.trim() || selectedFile) {
      const newMessage = { role: 'user', content: input, file: selectedFile }
      setMessages([...messages, newMessage])
      setInput('')
      setSelectedFile(null)
      setIsLoading(true)
      const content = newMessage.content
      
      // Simulating API call
      try {
        const response = await fetch(`${API_ENDPOINT_URL}/ask/assistant`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              thread_id: thread,
              query: content,
              assistant_id: valueAssistant,
              vector_store_id: valueVector
          }),
      });
        const result = await response.json();
        const showMessage = result.response;
        const assistantResponse = { role: 'assistant', content: showMessage }
        setMessages(prevMessages => [...prevMessages, assistantResponse])
      } catch (error) {
        console.error('Error in API call:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleBack = () => {
    setThread(null);
    setIsThreadCreated(false);
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

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
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center flex-1">
          <img src="/iatic_logo.svg?height=40&width=160" alt="Company Logo" className="h-10 w-30" />
        </div>
        <div className="flex items-center flex-1">
            <Popover open={openAssistant} onOpenChange={setOpenAssistant}>
            <PopoverTrigger asChild>
                <Button
                variant="outline"
                role="combobox"
                aria-expanded={openAssistant}
                className="w-[200px] justify-between"
                >
                {valueAssistant
                    ? assistants.find((assistant) => assistant.value === valueAssistant)?.label
                    : "Select assistant..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                <CommandList>
                    <CommandEmpty>No assistant found.</CommandEmpty>
                    <CommandGroup>
                    {assistants.map((assistant) => (
                        <CommandItem
                        key={assistant.value}
                        value={assistant.value}
                        onSelect={(currentValue) => {
                            setValueAssistant(currentValue === valueAssistant ? "" : currentValue)
                            setOpenAssistant(false)
                        }}
                        >
                        <Check
                            className={cn(
                            "mr-2 h-4 w-4",
                            valueAssistant === assistant.value ? "opacity-100" : "opacity-0"
                            )}
                        />
                        {assistant.label}
                        </CommandItem>
                    ))}
                    </CommandGroup>
                </CommandList>
                </Command>
            </PopoverContent>
            </Popover>
        </div>
        <div className="flex items-center flex-1">
            <Popover open={openVector} onOpenChange={setOpenVector}>
            <PopoverTrigger asChild>
                <Button
                variant="outline"
                role="combobox"
                aria-expanded={openVector}
                className="w-[200px] justify-between"
                >
                {valueVector
                    ? vectorStores.find((vectorStore) => vectorStore.value === valueVector)?.label
                    : "Select vectorStore..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                <CommandList>
                    <CommandEmpty>No vectorStore found.</CommandEmpty>
                    <CommandGroup>
                    {vectorStores.map((vectorStore) => (
                        <CommandItem
                        key={vectorStore.value}
                        value={vectorStore.value}
                        onSelect={(currentValue) => {
                            setValueVector(currentValue === valueVector ? "" : currentValue)
                            setOpenVector(false)
                        }}
                        >
                        <Check
                            className={cn(
                            "mr-2 h-4 w-4",
                            valueVector === vectorStore.value ? "opacity-100" : "opacity-0"
                            )}
                        />
                        {vectorStore.label}
                        </CommandItem>
                    ))}
                    </CommandGroup>
                </CommandList>
                </Command>
            </PopoverContent>
            </Popover>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-100" onClick={handleBack}>
          <Link href="/">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg max-w-[80%] break-words ${
              message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
            }`}>
              {message.content}
              {message.file && (
                <div className="mt-2 text-sm text-gray-300">
                  Attached: {message.file.name}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="bg-gray-700 p-2 rounded-lg inline-block"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </motion.div>
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-2 p-2 bg-gray-800 rounded-lg flex items-center justify-between"
            >
              <span className="text-sm text-gray-300">
                {selectedFile.name} ({selectedFile.type})
              </span>
              <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex space-x-2">
          <Textarea
            ref={textareaRef}
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (!isLoading) handleSend()
              }
            }}
            className="flex-1 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 min-h-[40px] max-h-[200px] overflow-y-auto resize-none"
            style={{
              height: 'auto',
              minHeight: '40px',
              maxHeight: '200px',
            }}
            disabled={isLoading}
          />
          <div className="flex flex-col justify-end">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              ref={imageInputRef}
              className="hidden"
              disabled={isLoading}
            />
            <Button variant="secondary" size="icon" onClick={() => imageInputRef.current.click()} disabled={isLoading}>
              <Image className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col justify-end">
            <input
              type="file"
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="hidden"
              disabled={isLoading}
            />
            <Button variant="secondary" size="icon" onClick={() => fileInputRef.current.click()} disabled={isLoading}>
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col justify-end">
            <Button onClick={handleSend} variant="secondary" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}