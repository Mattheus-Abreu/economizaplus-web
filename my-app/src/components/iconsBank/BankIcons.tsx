import React from "react";
import { View } from "react-native";
import NubankSvg from "../../assets/banks/nubank.svg";
import BancodobrazilSvg from "../../assets/banks/bancodobrasil.svg";
import ItauSvg from "../../assets/banks/itau.svg";
import InterSvg from "../../assets/banks/inter.svg";
import SantanderSvg from "../../assets/banks/santander.svg";
import CaixaSvg from "../../assets/banks/caixa.svg";
import BtgSvg from "../../assets/banks/btg.svg";
import BradescSvg from "../../assets/banks/bradesco.svg";  
import MercadopagoSvg from "../../assets/banks/mercadopago.svg";
import PicpaySvg from "../../assets/banks/picpay.svg";
import PagbankSvg from "../../assets/banks/pagbank.svg";
import C6Svg from "../../assets/banks/c6.svg";
import SicrediSvg from "../../assets/banks/sicredi.svg";
import NeonSvg from "../../assets/banks/neon.svg";
import OriginalSvg from "../../assets/banks/original.svg";

const bankSvgs: Record<string, React.ComponentType<any>> = {
    nubank: NubankSvg,
    bancodobrasil: BancodobrazilSvg,
    itau: ItauSvg,
    inter: InterSvg,
    santander: SantanderSvg,
    caixa: CaixaSvg,
    btg: BtgSvg,
    bradesco: BradescSvg,
    mercadopago: MercadopagoSvg,
    picpay: PicpaySvg,
    pagbank: PagbankSvg,
    c6: C6Svg,
    sicredi: SicrediSvg,
    neon: NeonSvg,
    original: OriginalSvg,
}

interface BankIconProps {
    bankName: string;
    size?: number;
}

const BankIcon: React.FC<BankIconProps> = ({ bankName, size = 25 }) => {
    const SvgComponent = bankSvgs[bankName.toLocaleLowerCase()];

    if (!SvgComponent) {
        return null;
    }

    return (
        <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
            <SvgComponent width={size} height={size} />
        </View>
    )
}

export default BankIcon;