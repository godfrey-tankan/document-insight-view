// components/PlagiarismSection.tsx
import { DocumentAnalysis, SourceMatch } from '@/types/analysis'
import { Progress } from '@/components/ui/progress'
import SourceItem from '@/components/SourceItem'

const PlagiarismSection = ({ analysis }: { analysis: DocumentAnalysis }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-semibold">
                Plagiarism Detection ({analysis.plagiarismScore}%)
            </h3>
            <Progress value={analysis.plagiarismScore} className="h-3" />

            <div className="space-y-4">
                {analysis.sourcesDetected.map((source, index) => (
                    <SourceItem
                        key={source.source || `source-${index}`}
                        source={source}
                        index={index}
                    />
                ))}

                {analysis.sourcesDetected.length === 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-green-700">
                        No significant plagiarism matches found
                    </div>
                )}
            </div>
        </div>
    )
}

export default PlagiarismSection