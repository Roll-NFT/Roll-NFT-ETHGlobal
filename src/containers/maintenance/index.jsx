import Image from "next/image";
import Button from "@ui/button";
import Logo from "@components/logo";
import { useChain, useMoralis } from "react-moralis";
import { useSelector } from "react-redux";
import Router from "next/router";

const MaintenanceArea = () => {
    const { switchNetwork } = useChain();
    const { enableWeb3 } = useMoralis();
    const user = useSelector((state) => state.user);

    async function switchToSupportedNetwork(networkId) {
        await enableWeb3();
        await switchNetwork(networkId);
        Router.push("/");
    }

    return (
        <div className="maintanance-heignt" data-black-overlay="7">
            <Image
                src="/images/bg/bg-image-1.jpg"
                alt="Slider BG"
                layout="fill"
                objectFit="cover"
                quality={100}
                priority
            />
            <div className="rn-comeing-soon-area ">
                <div className="container-fluid pt--40 pb--35 maintanance-plr text-center">
                    <Logo
                        logo={[
                            { src: "/images/logo/logo-white.png" },
                            { src: "/images/logo/logo-white.png" },
                            { src: "/images/logo/logo-white.png" },
                        ]}
                    />
                    <div className="maintanance-inner">
                        <div className="wrapper">
                            <h2>
                                <span>{user && <span>{user.chain}</span>}</span>
                                <br />
                                is not supported
                            </h2>
                            <p>
                                Unfortunately the network you are currently
                                connected is not yet supported by us.
                            </p>
                            <Button
                                path="#!"
                                className="mt--30 me-5"
                                onClick={() =>
                                    switchToSupportedNetwork(
                                        process.env.NEXT_PUBLIC_APP_CHAIN_ID_HEX
                                    )
                                }
                            >
                                Switch to{" "}
                                {process.env.NEXT_PUBLIC_APP_CHAIN_ID_NAME}
                            </Button>
                            <Button
                                path="#!"
                                className="mt--30"
                                onClick={() =>
                                    switchToSupportedNetwork(
                                        process.env
                                            .NEXT_PUBLIC_APP_CHAIN_ID_HEX_ALT
                                    )
                                }
                            >
                                Switch to{" "}
                                {process.env.NEXT_PUBLIC_APP_CHAIN_ID_NAME_ALT}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceArea;
