'use server'
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/drizzle";
import { Item, items, NewItem } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type fetchItemsResult = { success: false, error: string } | { success: true, items: Item[] };
export const fetchItems = async () : Promise<fetchItemsResult> => {
    const db = getDb();
    const session = await getSession();
    if (!session) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    const items = await db.query.items.findMany({
        where: (items, { eq }) => eq(items.userId, session.userId)
    });

    return {
        success: true,
        items,
    }
}

type UpdateItemResult = { success: false, error: string } | { success: true, item: Item };
export const addItem = async (item: NewItem) : Promise<UpdateItemResult> => {
    const session = await getSession();
    if (!session) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    const db = getDb();
    item.userId = session.userId;
    const [insertedItem] = await db.insert(items).values(item).returning();
    if (!insertedItem) {
        return {
            success: false,
            error: "Failed to insert item",
        };
    }

    return {
        success: true,
        item: insertedItem,
    };
}

export const updateItem = async (item: Item) : Promise<UpdateItemResult> => {
    
    const session = await getSession();
    if (!session) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    if (!item.id) {
        return {
            success: false,
            error: "Missing item identifier"
        };
    }

    const db = getDb();
    const existingItem = await db.query.items.findFirst({
        where: (items, { eq }) => eq(items.id, item.id)
    });

    if (!existingItem) {
        return {
            success: false,
            error: "Item does not exist"
        };
    }

    if (existingItem.userId != session.userId) {
        return {
            success: false,
            error: `${existingItem.userId}`,
        };
    }

    const [updatedItem] = await db.update(items)
    .set({ 
        name: item.name, 
        updatedAt: new Date(Date.now()), 
        data: item.data,
    })
    .where(eq(items.id, item.id)).returning();

    if (!updatedItem) {
        return {
            success: false,
            error: "Failed to update item",
        };
    }
    return {
        success: true,
        item: updatedItem,
    }
}

type DeleteItemResult = { success: false, error: string } | { success: true };
export const deleteItem = async (item: Item) : Promise<DeleteItemResult> => {
    const session = await getSession();
    if (!session) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    if (session.userId != item.userId) {
        return {
            success: false,
            error: "User does not have permission",
        };
    }

    const db = getDb();
    try {
        await db.delete(items).where(eq(items.id, item.id));
        return {
            success: true,
        }
    } catch (e) {
        return {
            success: false,
            error: (e as Error).message
        }
    }
}