import { useState } from 'react'
import { SourceMatch } from '@/types/analysis'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SourceItemProps {
    source: SourceMatch
    index: number
}

const SourceItem = ({ source, index }: SourceItemProps) => {
    const [expanded, setExpanded] = useState(false)
    const hasSnippets = (source.snippets?.length || 0) > 0

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-medium">
                        {index + 1}
                    </div>
                    <div>
                        <h4 className="font-medium">{source.source || 'Unknown Source'}</h4>
                        {source.url && (
                            <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-teal-600 hover:underline"
                            >
                                {source.url || 'No URL available'}
                            </a>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary">{source.matchPercentage ?? 0}% Match</Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        disabled={!hasSnippets}
                    >
                        {expanded ? 'Hide' : 'Show'} Snippets
                    </Button>
                </div>
            </div>

            {expanded && hasSnippets && (
                <div className="p-4 bg-white border-t border-gray-200 space-y-2">
                    {source.snippets?.map((snippet, idx) => (
                        <div key={idx} className="text-sm bg-gray-50 p-3 rounded border border-gray-100">
                            "{snippet || 'No text available'}"
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SourceItem