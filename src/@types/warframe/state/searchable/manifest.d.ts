declare namespace wf {
    namespace manifest {
        interface Manifest {
            Manifest?: (ManifestEntity)[] | null;
        }
        interface ManifestEntity {
            uniqueName: string;
            textureLocation: string;
            fileTime: number;
        }
    }
}