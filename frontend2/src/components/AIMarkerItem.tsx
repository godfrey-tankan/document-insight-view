import { AIMarker } from '@/types/analysis'
import { Badge } from '@/components/ui/badge'

interface AIMarkerItemProps {
    marker: AIMarker
    index: number
}

const AIMarkerItem = ({ marker, index }: AIMarkerItemProps) => {
    const sections = marker.sections || []
    const confidence = marker.confidence ?? 0

    return (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{marker.type || `AI Marker ${index + 1}`}</h4>
                <Badge className={getAIConfidenceClass(confidence)}>
                    {confidence}% Confidence
                </Badge>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
                {sections.slice(0, 2).map((section, idx) => (
                    <p key={idx} className="truncate">"{section || 'No content'}"</p>
                ))}
                {sections.length > 2 && (
                    <p className="text-blue-600 text-sm">
                        + {sections.length - 2} more sections
                    </p>
                )}
            </div>
        </div>
    )
}

const getAIConfidenceClass = (confidence: number) => {
    if (confidence > 85) return 'bg-red-100 text-red-700'
    if (confidence > 70) return 'bg-orange-100 text-orange-700'
    return 'bg-blue-100 text-blue-700'
}

export default AIMarkerItem