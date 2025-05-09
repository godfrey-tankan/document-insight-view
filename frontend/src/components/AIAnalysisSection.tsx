// components/AIAnalysisSection.tsx
import { DocumentAnalysis, AIMarker } from '@/types/analysis'
import { Progress } from '@/components/ui/progress'
import AIMarkerItem from '@/components/AIMarkerItem'

const AIAnalysisSection = ({ analysis }: { analysis: DocumentAnalysis }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-semibold">
                AI Detection Analysis ({analysis.aiScore}%)
            </h3>
            <Progress value={analysis.aiScore} className="h-3" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.aiMarkers.map((marker, index) => (
                    <AIMarkerItem
                        key={marker.type || `marker-${index}`}
                        marker={marker}
                        index={index}
                    />
                ))}

                {analysis.aiMarkers.length === 0 && (
                    <div className="col-span-full p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-700">
                        No significant AI markers detected
                    </div>
                )}
            </div>
        </div>
    )
}

export default AIAnalysisSection