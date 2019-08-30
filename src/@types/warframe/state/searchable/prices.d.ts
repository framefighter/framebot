declare namespace wf {
    namespace prices {
        interface Price {
            Title: string;
            Type?: string | null;
            SupDem?: (number)[] | null;
            SupDemNum?: (number)[] | null;
            Components?: (ComponentsEntity | null)[] | null;
            id: string;
        }
        interface ComponentsEntity {
            name: string;
            avg: string;
            comp_val_rt: string;
            data?: (number | null)[] | null;
            visible: boolean;
        }
    }
}