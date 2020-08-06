export declare type ActionPayload = {
    type: string;
    meta: {
        source: string;
    };
    payload: {
        contentId: string;
        contentTypeId: string;
    };
};
export declare enum ActionContentTypes {
    Updated = "content/CONTENT_UPDATED",
    Created = "content/CONTENT_CREATED",
    Deleted = "content/CONTENT_DELETED",
    Locked = "content/CONTENT_LOCKED",
    Unlocked = "content/CONTENT_UNLOCKED",
    Archived = "content/CONTENT_ARCHIVED"
}
//# sourceMappingURL=pusher.d.ts.map