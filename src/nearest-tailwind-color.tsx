import { useCallback, useState } from "react";
import { Action, ActionPanel, List, Icon } from "@raycast/api";

import COLORS from "./colors.json";
import { ColorArray, hexToRgb, rgb2lab, deltaE00 } from "./utils";

type ColorEntry = { name: string; hex: string; lab: ColorArray };

const hexRegex = /^#[0-9a-f]{6}$/i;

const ColorListItem = ({ result }: { result: ColorEntry & { delta: number } }) => {
  return (
    <List.Item
      title={`${result.name}`}
      icon={{ source: Icon.CircleFilled, tintColor: result.hex }}
      accessories={[{ text: `ΔE = ${result.delta}` }]}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.CopyToClipboard title="Copy class" content={result.name} />
            <Action.CopyToClipboard title="Copy hex" content={result.hex} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
};

const Command = () => {
  const [results, setResults] = useState<(ColorEntry & { delta: number })[]>([]);

  const findNearestColor = useCallback((query: string) => {
    if (!hexRegex.test(query)) return;

    const rgb = hexToRgb(query.substring(1));
    const lab = rgb2lab(rgb);

    const deltas = (COLORS as ColorEntry[]).map((color) => {
      return { ...color, delta: deltaE00(lab, color.lab as ColorArray) };
    });

    deltas.sort((a, b) => a.delta - b.delta);
    setResults(deltas.slice(0, 5));
  }, []);

  return (
    <List onSearchTextChange={findNearestColor} throttle searchBarPlaceholder="Enter HEX color code...">
      {results.length > 0 && (
        <>
          <List.Section title="Best match">
            <ColorListItem result={results[0]} />
          </List.Section>
          <List.Section title="Close matches">
            {results.slice(1).map((result, i) => (
              <ColorListItem key={`result-${i}`} result={result} />
            ))}
          </List.Section>
        </>
      )}
    </List>
  );
};

export default Command;
