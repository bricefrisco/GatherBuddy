import {useEvents} from "../context/EventsContext.jsx";
import {useCallback, useEffect, useRef, useState} from "react";
import items from '../assets/items.json';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../catalyst/table.jsx";
import moment from "moment";

const GatheringTable = () => {
    const eventBus = useEvents();
    const gatheringId = useRef(0);
    const amounts = useRef({});
    const [gatheringItems, setGatheringItems] = useState([]);
    const [totalResourcesGathered, setTotalResourcesGathered] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [duration, setDuration] = useState('00:00:00');

    const onHarvestStart = useCallback((parameters) => {
        const id = parameters['0'];
        if (!id) {
            return; // TODO: Look into why
        }
        gatheringId.current = parameters['0'];
    }, []);

    const onHarvestCancel = useCallback((parameters) => {
        if (gatheringId.current === parameters['1']) {
            gatheringId.current = 0;
        }
    }, []);

    const onHarvestFinished = useCallback((parameters) => {
        if (gatheringId.current === parameters['1']) {
            gatheringId.current = 0;
        }
    }, []);

    const onNewSimpleItem = useCallback((parameters) => {
        if (gatheringId.current === 0) {
            return;
        }

        const item = items[parameters['1']]; // ITEM_ID
        const amount = parameters['2']; // Total amount in players inventory
        const value = Math.round(parameters['4'] / 10000); // Value of a single item in silver

        let actualAmount;
        if (!amounts.current[item]) {
            if (amount > 10) {
                // It is not possible that more than 10 items are gathered at once,
                // so assume the player already had some resources in their inventory. There is really no way to tell
                // how many the player started with, so simply assume they gathered two resources.
                // This may be incorrect, but it is better than any other alternative I can currently think of.
                actualAmount = 2;
            } else {
                actualAmount = amount;
            }
        } else {
            actualAmount = amount - amounts.current[item];
        }

        // Unlikely, but user could have removed some items from their inventory.
        // In this case, we assume they gathered two items.
        if (actualAmount <= 0) {
            actualAmount = 2;
        }

        const totalAmount = actualAmount * value;

        amounts.current[item] = amount;
        setTotalResourcesGathered((prev) => prev + actualAmount);
        setTotalAmount((prev) => prev + totalAmount);
        setGatheringItems((prev) => [
            ...prev,
            {
                id: items[parameters['1']],
                amount: actualAmount,
                value: totalAmount,
            }
        ])
    }, []);

    const formatSilverAmount = useCallback((num) => {
        if (num >= 1_000_000) {
            return (num / 1_000_000).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1') + 'm';
        }
        if (num >= 1_000) {
            return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return num.toString();
    }, []);

    useEffect(() => {
        eventBus.on('operation:HarvestStart', onHarvestStart);
        eventBus.on('operation:HarvestCancel', onHarvestCancel);
        eventBus.on('event:HarvestFinished', onHarvestFinished);
        eventBus.on('event:NewSimpleItem', onNewSimpleItem);

        return () => {
            eventBus.off('operation:HarvestStart', onHarvestStart);
            eventBus.off('operation:HarvestCancel', onHarvestCancel);
            eventBus.off('event:HarvestFinished', onHarvestFinished);
            eventBus.off('event:NewSimpleItem', onNewSimpleItem);
        }
    }, [eventBus, onHarvestStart, onHarvestCancel, onHarvestFinished, onNewSimpleItem]);

    useEffect(() => {
        const startTime = moment();

        const interval = setInterval(() => {
            const now = moment();
            const diff = moment.duration(now.diff(startTime));
            const formatted = moment.utc(diff.asMilliseconds()).format('HH:mm:ss');
            setDuration(formatted);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center">
            <div className="w-full pt-5 pb-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-base/7 text-gray-400">Current session duration</dt>
                            <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                                {duration}
                            </dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-base/7 text-gray-400">Total silver amount</dt>
                            <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                                {formatSilverAmount(totalAmount)}
                            </dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-base/7 text-gray-400">Resources gathered</dt>
                            <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                                {formatSilverAmount(totalResourcesGathered)}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="max-h-[400px] px-6 lg:px-7 max-w-7xl w-full overflow-y-auto">
                <Table dense className="table-fixed">
                    <TableHead sticky>
                        <TableRow>
                            <TableHeader>Item</TableHeader>
                            <TableHeader>Amount</TableHeader>
                            <TableHeader>Silver</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[...gatheringItems].reverse().map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">
                                    <div className="inline-flex items-center justify-center">
                                        <img src={`https://render.albiononline.com/v1/item/${item.id}.png`} alt={item.id} className="size-12 mr-2"/>
                                        {item.id}
                                    </div>
                                </TableCell>
                                <TableCell>{item.amount}</TableCell>
                                <TableCell className="text-zinc-500">{item.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default GatheringTable;