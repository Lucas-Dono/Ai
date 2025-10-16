"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function AgentMessageTestPage() {
  const [agentId, setAgentId] = useState("");
  const [message, setMessage] = useState("Hola");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (type, data) => {
    setLogs(prev => [...prev, { timestamp: new Date().toISOString(), type, data }]);
  };

  const sendMessage = async () => {
    if (!agentId.trim() || !message.trim()) return;
    setLoading(true);
    const startTime = Date.now();
    try {
      addLog("request", { agentId, message });
      const response = await fetch("/api/agents/" + agentId + "/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const duration = Date.now() - startTime;
      const data = await response.json();
      if (!response.ok) {
        addLog("error", { status: response.status, duration: duration + "ms", error: data.error || "Unknown error", details: data });
      } else {
        addLog("success", { duration: duration + "ms", reply: data.reply });
      }
    } catch (error) {
      addLog("error", { type: "network_error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Agent Message API Tester</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Test Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Agent ID</label>
                <Input placeholder="Agent ID" value={agentId} onChange={(e) => setAgentId(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
              </div>
              <Button onClick={sendMessage} disabled={loading || !agentId.trim()} className="w-full">
                {loading ? "Sending..." : "Send Message"}
              </Button>
              <div className="text-xs text-muted-foreground">
                Success: {logs.filter(l => l.type === "success").length} | Errors: {logs.filter(l => l.type === "error").length}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Logs</CardTitle></CardHeader>
          <CardContent className="overflow-auto max-h-96">
            {logs.length === 0 ? <div className="text-muted-foreground">No logs yet</div> : (
              <div className="space-y-2 font-mono text-xs">
                {logs.map((log, i) => (
                  <div key={i} className={"border rounded p-2 " + (log.type === "error" ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50")}>
                    <div className="font-bold">{log.type.toUpperCase()}</div>
                    <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(log.data, null, 2)}</pre>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
