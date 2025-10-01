


import Stack from "react-stackai";

export default function FloatingChat() {
    const [open, setOpen] = useState(false);

    return (
        <>




            {/* Conteneur Stack AI */}
            <div className="flex-1">
                <Stack
                    project="https://www.stack-ai.com/embed/0a7c38cb-efcb-4763-a1ce-52f09f9f8dab/0b999669-1767-46da-9e9a-193be5d1a4b9/68dbdee98451de57f2126d98"
                />
            </div>

        </>
    );
}
