import { Button } from "@/components/ui/button"
import { InputWithButton } from "@/components/ui/input-with-button"

interface NavbarProps {
  showInput?: boolean
}

export const Navbar = ({ showInput = false }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#faf9f5]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-8 w-auto"
            />
          </a>
          
          <div className="flex items-center gap-4">
            {/* Input field (shows when scrolled past hero) */}
            {showInput && (
              <div className="w-[320px]">
                <InputWithButton
                  placeholder="Enter your email"
                  buttonText="Get started"
                  buttonVariant="default"
                  buttonSize="sm"
                  buttonProps={{ className: "text-white" }}
                />
              </div>
            )}
            
            {/* Sign in button */}
            <Button variant="outline" size="default">
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
