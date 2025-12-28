import type {IGodFavor} from "./IGodFavor.ts";
import {ThorsStrike} from "./ThorsStrike.ts";
import {IdunnsRejuvenation} from "./IdunnsRejuvenation.ts";
import {VidarrsMight} from "./VidarrsMight.ts";
import {UllrsAim} from "./UllrsAim.ts";
import {BaldrsInvulnerability} from "./BaldrsInvulnerability.ts";
import {HeimdallsWatch} from "./HeimdallsWatch.ts";
import {BrunhildsFury} from "./BrunhildsFury.ts";
import {FreyrsGift} from "./FreyrsGift.ts";
import {HelsGrip} from "./HelsGrip.ts";
import {SkadisHunt} from "./SkadisHunt.ts";
import {SkuldsClaim} from "./SkuldsClaim.ts";
import {FriggsSight} from "./FriggsSight.ts";
import {FreyjasPlenty} from "./FreyjasPlenty.ts";
import {LokisTrick} from "./LokisTrick.ts";
import {OdinsSacrifice} from "./OdinsSacrifice.ts";
import {TyrsPledge} from "./TyrsPledge.ts";
import {MimirsWisdom} from "./MimirsWisdom.ts";
import {BragisVerve} from "./BragisVerve.ts";
import {VarsBond} from "./VarsBond.ts";
import {ThrymrsTheft} from "./ThrymrsTheft.ts";

export const AVAILABLE_GODS : IGodFavor[] = [
    new ThorsStrike(),
    new IdunnsRejuvenation(),
    new VidarrsMight(),
    new UllrsAim(),
    new HeimdallsWatch(),
    new BaldrsInvulnerability(),
    new BrunhildsFury(),
    new FreyrsGift(),
    new HelsGrip(),
    new SkadisHunt(),
    new SkuldsClaim(),
    new FriggsSight(),
    new LokisTrick(),
    new FreyjasPlenty(),
    new MimirsWisdom(),
    new BragisVerve(),
    new OdinsSacrifice(),
    new VarsBond(),
    new ThrymrsTheft(),
    new TyrsPledge()
];