import { useState, useEffect } from "react";
import { useEditor } from "@/lib/context";
import { generateBordersXml, generateGroundsXml, generateDoodadsXml, generateWallsXml } from "@/lib/xml-generators";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, CodeXml } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function XmlPreview() {
  const { state } = useEditor();
  const { toast } = useToast();
  const [xmlContent, setXmlContent] = useState("");
  
  useEffect(() => {
    let xml = "";
    if (state.activeCategory === "borders") {
      xml = generateBordersXml(state.borders);
    } else if (state.activeCategory === "grounds") {
      xml = generateGroundsXml(state.grounds);
    } else if (state.activeCategory === "doodads") {
      xml = generateDoodadsXml(state.doodads);
    } else if (state.activeCategory === "walls") {
      xml = generateWallsXml(state.walls);
    }
    setXmlContent(xml);
  }, [state]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      toast({
        title: "Copied to clipboard",
        description: "The XML output has been copied.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "An error occurred while copying to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.activeCategory}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: `File saved as ${state.activeCategory}.xml`,
    });
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-l border-sidebar-border w-96">
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <h3 className="font-semibold text-sidebar-foreground flex items-center gap-2">
          <CodeXml className="w-4 h-4 text-primary" />
          XML Output
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy to Clipboard" data-testid="button-copy-xml">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownload} title="Download XML" data-testid="button-download-xml">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4 bg-[#0d0f15]">
        <pre className="font-mono text-xs text-blue-300 whitespace-pre-wrap break-all">
          {xmlContent}
        </pre>
      </ScrollArea>
    </div>
  );
}
