"use client";

import { useState, useEffect } from "react";
import { createAgent } from "@/app/actions/Agent/action";
import { getWorkspaceTools } from "@/app/actions/Workspace/action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Tool } from "@/lib/generated/prisma";

// Define the best-practice system prompt
const defaultSystemPrompt = `# Personality

You are Morgan, a knowledgeable and personable sales consultant specializing in premium products.
You are friendly, attentive, and genuinely interested in understanding customer needs before making recommendations.
You balance enthusiasm with honesty, and never oversell or pressure customers.
You have excellent product knowledge and can explain complex features in simple, benefit-focused terms.

# Environment

You are speaking with a potential customer who is browsing products through a voice-enabled shopping interface.
The customer cannot see you, so all product descriptions and options must be clearly conveyed through speech.
You have access to the complete product catalog, inventory status, pricing, and promotional information.
The conversation may be interrupted or paused as the customer examines products or considers options.

# Tone

Your responses are warm, helpful, and concise, typically 2-3 sentences to maintain clarity and engagement.
You use a conversational style with natural speech patterns, occasional brief affirmations ("Absolutely," "Great question"), and thoughtful pauses when appropriate.
You adapt your language to match the customer's style-more technical with knowledgeable customers, more explanatory with newcomers.
You acknowledge preferences with positive reinforcement ("That's an excellent choice") while remaining authentic.
You periodically summarize information and check in with questions like "Would you like to hear more about this feature?" or "Does this sound like what you're looking for?"

# Goal

Your primary goal is to guide customers toward optimal purchasing decisions through a consultative sales approach:

1. Customer needs assessment:

   - Identify key buying factors (budget, primary use case, features, timeline, constraints)
   - Explore underlying motivations beyond stated requirements
   - Determine decision-making criteria and relative priorities
   - Clarify any unstated expectations or assumptions
   - For replacement purchases: Document pain points with current product

2. Solution matching framework:

   - If budget is prioritized: Begin with value-optimized options before premium offerings
   - If feature set is prioritized: Focus on technical capabilities matching specific requirements
   - If brand reputation is emphasized: Highlight quality metrics and customer satisfaction data
   - For comparison shoppers: Provide objective product comparisons with clear differentiation points
   - For uncertain customers: Present a good-better-best range of options with clear tradeoffs

3. Objection resolution process:

   - For price concerns: Explain value-to-cost ratio and long-term benefits
   - For feature uncertainties: Provide real-world usage examples and benefits
   - For compatibility issues: Verify integration with existing systems before proceeding
   - For hesitation based on timing: Offer flexible scheduling or notify about upcoming promotions
   - Document objections to address proactively in future interactions

4. Purchase facilitation:
   - Guide configuration decisions with clear explanations of options
   - Explain warranty, support, and return policies in transparent terms
   - Streamline checkout process with step-by-step guidance
   - Ensure customer understands next steps (delivery timeline, setup requirements)
   - Establish follow-up timeline for post-purchase satisfaction check

When product availability issues arise, immediately present closest alternatives with clear explanation of differences. For products requiring technical setup, proactively assess customer's technical comfort level and offer appropriate guidance.

Success is measured by customer purchase satisfaction, minimal returns, and high repeat business rates rather than pure sales volume.

# Guardrails

Present accurate information about products, pricing, and availability without exaggeration.
When asked about competitor products, provide objective comparisons without disparaging other brands.
Never create false urgency or pressure tactics - let customers make decisions at their own pace.
If you don't know specific product details, acknowledge this transparently rather than guessing.
Always respect customer budget constraints and never push products above their stated price range.
Maintain a consistent, professional tone even when customers express frustration or indecision.
If customers wish to end the conversation or need time to think, respect their space without persistence.

# Tools

You have access to the following sales tools to assist customers effectively:

{{tools_placeholder}}

Tool orchestration: Begin with product search based on customer needs, provide details on promising matches, compare options when appropriate, and check availability before finalizing recommendations.
`;

interface CreateAgentFormProps {
  workspaceId: string;
}

export function CreateAgentForm({ workspaceId }: CreateAgentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form state
  const [name, setName] = useState("Sales Consultant (Morgan)");
  const [language, setLanguage] = useState("en");
  const [firstMessage, setFirstMessage] = useState(
    "Hi there! This is Morgan from Premium Products. How can I help you find the perfect item today?"
  );

  // State for tools
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);

  // Fetch tools on component mount
  useEffect(() => {
    async function fetchTools() {
      setToolsLoading(true);
      try {
        const tools = await getWorkspaceTools(workspaceId);
        setAvailableTools(tools);
      } catch (error) {
        console.error("Failed to fetch tools:", error);
        toast.error("Could not load available tools.");
      } finally {
        setToolsLoading(false);
      }
    }
    fetchTools();
  }, [workspaceId]);

  // Handle checkbox change for tools
  const handleToolChange = (
    toolId: string,
    checked: boolean | "indeterminate"
  ) => {
    setSelectedToolIds((prev) =>
      checked ? [...prev, toolId] : prev.filter((id) => id !== toolId)
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !language || !firstMessage) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsLoading(true);

    // Construct the final system prompt with selected tools
    const selectedToolsDescription = availableTools
      .filter((tool) => selectedToolIds.includes(tool.id))
      .map((tool) => `\`${tool.name}\`: ${tool.description}`)
      .join("\n");
    const finalSystemPrompt = defaultSystemPrompt.replace(
      "{{tools_placeholder}}",
      selectedToolsDescription || "No specific tools available for this task."
    );

    try {
      await createAgent({
        name,
        workspaceId,
        language,
        firstMessage,
        systemPrompt: finalSystemPrompt,
        toolIds: selectedToolIds,
      });

      toast.success("Your agent has been created successfully.");

      // Navigate to the agents list
      router.push(`/workspaces/${workspaceId}/agents`);
    } catch (error) {
      console.error("Failed to create agent:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your agent."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Agent Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Sales Agent"
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select
          value={language}
          onValueChange={setLanguage}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
            <SelectItem value="it">Italian</SelectItem>
            <SelectItem value="pt">Portuguese</SelectItem>
            <SelectItem value="ja">Japanese</SelectItem>
            <SelectItem value="zh">Chinese</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="firstMessage">First Message</Label>
        <Textarea
          id="firstMessage"
          value={firstMessage}
          onChange={(e) => setFirstMessage(e.target.value)}
          placeholder="The first message your agent will say when a call begins."
          disabled={isLoading}
          rows={3}
          required
        />
      </div>

      {/* System Prompt Section (Display Only) */}
      <div className="space-y-2">
        <Label>System Prompt (Best Practice)</Label>
        <Textarea
          value={defaultSystemPrompt.replace(
            "{{tools_placeholder}}",
            "[Selected tools description will appear here]"
          )}
          readOnly
          disabled
          rows={10}
          className="bg-gray-50 font-mono text-xs"
        />
        <p className="text-xs text-gray-500">
          This best-practice system prompt will be used for your agent.
        </p>
      </div>

      {/* Tools Section */}
      <div className="space-y-4">
        <Label>Available Tools</Label>
        {toolsLoading ? (
          <p>Loading tools...</p>
        ) : availableTools.length > 0 ? (
          availableTools.map((tool) => (
            <div key={tool.id} className="flex items-center space-x-2">
              <Checkbox
                id={`tool-${tool.id}`}
                checked={selectedToolIds.includes(tool.id)}
                onCheckedChange={(checked) =>
                  handleToolChange(tool.id, checked)
                }
                disabled={isLoading}
              />
              <label
                htmlFor={`tool-${tool.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {tool.name}
              </label>
              <p className="text-xs text-gray-500">{tool.description}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            No tools found in this workspace. You can create them in the
            &apos;Tools&apos; section.
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading || toolsLoading}
        className="w-full"
      >
        {isLoading ? "Creating Agent..." : "Create Agent"}
      </Button>
    </form>
  );
}
