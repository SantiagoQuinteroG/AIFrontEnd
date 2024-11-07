
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import Link from "next/link"

export function MenuCarousel() {
  return (
    <div className="relative w-full h-screen">
        <div className="flex items-center justify-center h-full">
          <Carousel className="w-full max-w-md" opts={{ loop: true }}>
            <CarouselContent>
              <CarouselItem>
                <Link href="/chat" className="flex flex-col items-center justify-center gap-4 p-6" prefetch={false}>
                  <div className="rounded-full bg-primary p-3 text-primary-foreground">
                    <MessageCircleIcon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">IATIC Chat</h3>
                    <p className="text-muted-foreground">Engage in real-time conversations.</p>
                  </div>
                </Link>
              </CarouselItem>
              <CarouselItem>
                <Link href="/assistant" className="flex flex-col items-center justify-center gap-4 p-6" prefetch={false}>
                  <div className="rounded-full bg-accent p-3 text-accent-foreground">
                    <BotIcon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">IATIC Assistant</h3>
                    <p className="text-muted-foreground">Get help from an intelligent assistant.</p>
                  </div>
                </Link>
              </CarouselItem>
              <CarouselItem>
                <Link href="#" className="flex flex-col items-center justify-center gap-4 p-6" prefetch={false}>
                  <div className="rounded-full bg-secondary p-3 text-secondary-foreground">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">Image Generation</h3>
                    <p className="text-muted-foreground">Create and manipulate images.</p>
                  </div>
                </Link>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
    </div>
  )
}

function BotIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}


function ImageIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}


function MessageCircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  )
}
