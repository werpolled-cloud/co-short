import React from "react";
import { Composition } from "remotion";
import { PaperTest } from "./demos/PaperTest";
import { VesselTest } from "./demos/VesselTest";
import { RabiesVideo, RABIES_FRAMES } from "./rabies/RabiesVideo";
import { CoVideo, CO_FRAMES } from "./co/CoVideo";
import { RadiumVideo, RADIUM_FRAMES } from "./radium/RadiumVideo";
import { Radium3DProbe } from "./radium/three/Probe3D";
import { CharSheet } from "./radium/three/CharSheet";
import { Isolate } from "./radium/three/Isolate";

// Новый ролик: скопировать src/rabies → src/<slug>, поменять shots.json / сцены / music_plan.json,
// и добавить сюда <Composition id="<Slug>" ...> по образцу Rabies.
export const Root: React.FC = () => (
  <>
    <Composition id="Rabies" component={RabiesVideo} durationInFrames={RABIES_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="DemoPaperHeart" component={PaperTest} durationInFrames={225} fps={30} width={1080} height={1920} />
    <Composition id="DemoVessel3D" component={VesselTest} durationInFrames={225} fps={30} width={1080} height={1920} />
    <Composition id="Co" component={CoVideo} durationInFrames={CO_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Isolate" component={Isolate} durationInFrames={2} fps={30} width={1080} height={1920} />
    <Composition id="CharSheet" component={CharSheet} durationInFrames={2} fps={30} width={1080} height={1920} />
    <Composition id="ProbeDip" component={() => <Radium3DProbe scene="dip" />} durationInFrames={135} fps={30} width={1080} height={1920} />
    <Composition id="ProbeLick" component={() => <Radium3DProbe scene="lick" />} durationInFrames={135} fps={30} width={1080} height={1920} />
    <Composition id="ProbeGlow" component={() => <Radium3DProbe scene="glow" />} durationInFrames={135} fps={30} width={1080} height={1920} />
    <Composition id="Radium" component={RadiumVideo} durationInFrames={RADIUM_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
