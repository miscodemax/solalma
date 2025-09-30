declare module "react-stackai" {
    import { ComponentType } from "react";
    interface StackProps {
        project: string;
    }
    const Stack: ComponentType<StackProps>;
    export default Stack;
}
