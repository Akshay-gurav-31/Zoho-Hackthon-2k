import { supabase } from '@/lib/supabase';

export interface Feedback {
    id: string;
    name: string;
    email: string;
    rating: number;
    comment: string;
    page: string;
    device: string;
    timestamp: string;
}

// Local storage key for feedback
const LOCAL_STORAGE_KEY = 'feedback_data';

/**
 * Save feedback to local storage
 * @param feedback - Feedback data to save
 */
function saveFeedbackToLocal(feedback: Feedback) {
    try {
        const existingData = localStorage.getItem(LOCAL_STORAGE_KEY);
        const feedbackArray = existingData ? JSON.parse(existingData) : [];
        feedbackArray.push(feedback);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(feedbackArray));
        return true;
    } catch (err) {
        console.error('Error saving to local storage:', err);
        return false;
    }
}

/**
 * Get feedback from local storage
 * @returns Array of feedback entries
 */
export function getFeedbackFromLocal(): Feedback[] {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error('Error reading from local storage:', err);
        return [];
    }
}

/**
 * Submit new feedback to local storage
 * @param feedback - Feedback data to submit
 * @returns Success status and error message if any
 */
export async function submitFeedback(feedback: Omit<Feedback, 'id' | 'timestamp'>) {
    try {
        const feedbackWithId: Feedback = {
            ...feedback,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        };
        
        if (saveFeedbackToLocal(feedbackWithId)) {
            return {
                success: true,
                data: feedbackWithId,
                error: null,
                isDuplicate: false
            };
        } else {
            return {
                success: false,
                error: 'Failed to save feedback locally.',
                isDuplicate: false
            };
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        return {
            success: false,
            error: 'An unexpected error occurred.',
            isDuplicate: false
        };
    }
}

/**
 * Get all feedback from local storage
 * @returns Array of feedback entries
 */
export async function getAllFeedback(): Promise<Feedback[]> {
    try {
        return getFeedbackFromLocal();
    } catch (err) {
        console.error('Unexpected error fetching feedback:', err);
        return [];
    }
}

/**
 * Subscribe to feedback updates (simulated for local storage)
 * @param callback - Function to call when new feedback is added
 * @returns Subscription object
 */
export function subscribeFeedback(callback: (feedback: Feedback) => void) {
    // For local storage, we'll simulate real-time updates by polling
    const interval = setInterval(() => {
        // In a real implementation, you might check for changes
        // For now, we'll just return a cleanup function
    }, 5000); // Check every 5 seconds
    
    return {
        interval,
        unsubscribe: () => {
            clearInterval(interval);
        }
    };
}
