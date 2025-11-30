import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { X, Star, Send } from "lucide-react";
import { toast } from "sonner";

interface Message {
  type: "bot" | "user";
  content: string;
}

interface FeedbackBotProps {
  onClose: () => void;
}

const FeedbackBot = ({ onClose }: FeedbackBotProps) => {
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { type: "bot", content: "Hi 👋! We'd love your feedback. Can we ask you a few questions to improve our service?" }
  ]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const validateName = (value: string): boolean => {
    const trimmed = value.trim();
    if (trimmed.length < 2) return false;
    if (/^[a-z]+$/i.test(trimmed) && trimmed.length < 4) return false;
    const invalidPatterns = ["test", "asdf", "qwer", "aaa", "bbb"];
    return !invalidPatterns.some(pattern => trimmed.toLowerCase().includes(pattern));
  };

  const validateEmail = (value: string): boolean => {
    if (!value) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = ["test@example.com", "111@111.com", "test@test.com"];
    return emailRegex.test(value) && !invalidEmails.includes(value.toLowerCase());
  };

  const validateComment = (value: string): boolean => {
    const trimmed = value.trim();
    if (trimmed.length < 5) return false;
    const invalidWords = ["ok", "good", "nice"];
    if (invalidWords.includes(trimmed.toLowerCase())) return false;
    if (/^(.)\1+$/.test(trimmed)) return false; // Repeated characters
    return true;
  };

  const handleStart = () => {
    setMessages([...messages, { type: "bot", content: "Great! Let's start. What's your name?" }]);
    setStep(1);
  };

  const handleNameSubmit = () => {
    if (!validateName(name)) {
      toast.error("Please enter a valid name (minimum 2 characters, no test data)");
      return;
    }
    setMessages([
      ...messages,
      { type: "user", content: name },
      { type: "bot", content: `Nice to meet you, ${name}! What's your email? (Optional)` }
    ]);
    setStep(2);
  };

  const handleEmailSubmit = () => {
    if (email && !validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setMessages([
      ...messages,
      { type: "user", content: email || "Skipped" },
      { type: "bot", content: "How would you rate your experience? (1-5 stars)" }
    ]);
    setStep(3);
  };

  const handleRatingSubmit = (selectedRating: number) => {
    setRating(selectedRating);
    setMessages([
      ...messages,
      { type: "user", content: `${selectedRating} stars` },
      { type: "bot", content: "Thank you! Please share your feedback or comments:" }
    ]);
    setStep(4);
  };

  const handleCommentSubmit = async () => {
    if (!validateComment(comment)) {
      toast.error("Please provide meaningful feedback (minimum 5 characters)");
      return;
    }

    // Store feedback locally
    const feedback = {
      name,
      email: email || "Not provided",
      rating,
      comment,
      page: window.location.href,
      device: navigator.userAgent,
    };

    setMessages([
      ...messages,
      { type: "user", content: comment },
      { type: "bot", content: "Saving your feedback..." }
    ]);

    // Import submitFeedback dynamically
    const { submitFeedback } = await import("@/services/feedbackService");
    const result = await submitFeedback(feedback);

    if (result.success) {
      setMessages([
        ...messages,
        { type: "user", content: comment },
        { 
          type: "bot", 
          content: `Thank you ${name}! Your feedback has been saved locally. 🌟`
        }
      ]);
      setStep(5);

      // Alert for low ratings
      if (rating <= 2) {
        toast.error("Low rating alert: This feedback requires immediate attention!", {
          duration: 5000,
        });
      } else {
        toast.success("Feedback saved successfully!");
      }

      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      // Handle error
      setMessages([
        ...messages,
        { type: "user", content: comment },
        {
          type: "bot", 
          content: "Sorry, there was an error saving your feedback. Please try again."
        }
      ]);

      toast.error(result.error || "Failed to save feedback");

      setTimeout(() => {
        onClose();
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-info p-4 flex justify-between items-center text-white">
          <h3 className="font-semibold">Feedback Assistant</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${msg.type === "user"
                  ? "bg-gradient-info text-white"
                  : "bg-card border border-border"
                  }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card">
          {step === 0 && (
            <div className="flex gap-2">
              <Button onClick={handleStart} className="flex-1 bg-gradient-info">
                Yes, Let's go!
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1 border-primary text-primary">
                No, thanks
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleNameSubmit()}
                className="flex-1"
                autoFocus
              />
              <Button onClick={handleNameSubmit} size="icon" className="bg-gradient-info">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email (optional)..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleEmailSubmit()}
                className="flex-1"
                autoFocus
              />
              <Button onClick={handleEmailSubmit} size="icon" className="bg-gradient-info">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2 justify-center" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingSubmit(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors duration-200 ${star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400 drop-shadow-md"
                        : "text-gray-300 fill-transparent"
                        }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {hoverRating ? (
                  hoverRating === 1 ? "Poor" :
                    hoverRating === 2 ? "Fair" :
                      hoverRating === 3 ? "Good" :
                        hoverRating === 4 ? "Very Good" : "Excellent"
                ) : "Select a rating"}
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <Textarea
                placeholder="Share your feedback..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
                autoFocus
              />
              <Button onClick={handleCommentSubmit} className="w-full bg-gradient-info">
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FeedbackBot;
