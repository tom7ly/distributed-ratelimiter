import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import "./SplitPane.css"; // Assuming you have a CSS file for styles

export const SplitPane = ({
    leftComponent,
    rightComponent,
    bottomComponent,
}: {
    leftComponent: JSX.Element;
    rightComponent: JSX.Element;
    bottomComponent?: JSX.Element; // Optional bottom component
}) => {
    const [leftWidth, setLeftWidth] = useState(80); // Initial width of the left pane
    const [topHeight, setTopHeight] = useState(bottomComponent ? "70%" : "100%"); // Initial height of the top pane
    const [dragging, setDragging] = useState(false);
    const [parentRect, setParentRect] = useState<DOMRect | null>(null);
    const dividerRef = useRef<HTMLDivElement>(null);
    const horizontalDividerRef = useRef<HTMLDivElement>(null); // Ref for the horizontal divider

    const startDragging = (e: React.MouseEvent) => {
        console.log("start dragging");

        setDragging(true);
        document.body.classList.add('no-select'); // Disable text selection
        if (e.currentTarget.parentElement) {
            const rect = e.currentTarget.parentElement.getBoundingClientRect();
            setParentRect(rect); // Store the parent's rect for width calculation during drag
        }
        window.addEventListener('mousemove', dragDivider);
        window.addEventListener('mouseup', stopDragging);
    };

    const startDraggingHorizontal = (e: React.MouseEvent) => {
        console.log("start dragging horizontal");
        setDragging(true);
        document.body.classList.add('no-select'); // Disable text selection
        if (e.currentTarget.parentElement) {
            const rect = e.currentTarget.parentElement.getBoundingClientRect();
            setParentRect(rect); // Store the parent's rect for height calculation during drag
        }
        window.addEventListener('mousemove', dragHorizontalDivider);
        window.addEventListener('mouseup', stopDragging);
    };

    const stopDragging = () => {
        document.body.classList.remove('no-select'); // Re-enable text selection
        if (dragging) {
            setDragging(false);
            setParentRect(null);
            window.removeEventListener('mousemove', dragDivider);
            window.removeEventListener('mousemove', dragHorizontalDivider);
            window.removeEventListener('mouseup', stopDragging);
        }
    };

    useEffect(() => {
        const divider = dividerRef.current;
        const horizontalDivider = horizontalDividerRef.current;
        if (divider) {
            divider.addEventListener('mousedown', startDragging as any);
        }
        if (horizontalDivider) {
            horizontalDivider.addEventListener('mousedown', startDraggingHorizontal as any);
        }
        return () => {
            if (divider) {
                divider.removeEventListener('mousedown', startDragging as any);
            }
            if (horizontalDivider) {
                horizontalDivider.removeEventListener('mousedown', startDraggingHorizontal as any);
            }
        };
    }, [startDragging, startDraggingHorizontal]);

    const dragDivider = (e: MouseEvent) => {
        if (dragging && parentRect) {
            e.stopPropagation();
            const newWidth = e.clientX - parentRect.left;
            let newWidthPercentage = (newWidth / parentRect.width) * 100;

            const minimumWidthPercentage = 40;
            const maximumWidthPercentage = 60;

            newWidthPercentage = Math.max(newWidthPercentage, minimumWidthPercentage);
            newWidthPercentage = Math.min(newWidthPercentage, maximumWidthPercentage);

            setLeftWidth(newWidthPercentage);
        }
    };

    const dragHorizontalDivider = (e: MouseEvent) => {
        if (dragging && parentRect) {
            const newHeight = e.clientY - parentRect.top;
            let newHeightPercentage = (newHeight / parentRect.height) * 100;

            const minimumHeightPercentage = 10; // Minimum height percentage for top pane
            const maximumHeightPercentage = 90; // Maximum height percentage for top pane

            newHeightPercentage = Math.max(newHeightPercentage, minimumHeightPercentage);
            newHeightPercentage = Math.min(newHeightPercentage, maximumHeightPercentage);

            setTopHeight(`${newHeightPercentage}%`);
        }
    };

    return (
        <Box
            sx={{
                width: "100%",
                height: "100vh", // Make sure it fills the container
                display: "flex",
                overflow: "auto",
                backgroundColor: "backgroundBlack.main", 
                flexDirection: "column", // Stack the main area and bottom component vertically
            }}
        >
            <Box
                sx={{
                    height: topHeight,
                    display: "flex", // This will keep the left and right components side by side
                }}
            >
                <Box
                    sx={{
                        width: `${leftWidth}%`,
                        minWidth: '40%',
                        maxWidth: '60%',
                        overflowY: "auto"
                    }}
                >
                    {leftComponent}
                </Box>
                <Box
                    bgcolor={dragging ? "primary.main" : "background.default"}
                    className="overlay"
                    sx={{
                        cursor: 'col-resize',
                        width: '1px',
                        position: 'relative',

                        "&:hover": {
                            backgroundColor: "primary.main",
                        },
                        "&::before": {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: '-10px',
                            right: '-10px',
                        }
                    }}
                    onMouseDown={startDragging}
                    ref={dividerRef} // Attach the ref here
                ></Box>
                <Box
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                    }}
                >
                    {rightComponent}

                </Box>
            </Box>
            {bottomComponent && (
                <>
                    <Box
                        sx={{
                            
                            cursor: 'row-resize',
                            height: '1px',
                            backgroundColor: 'divider',
                            position: 'relative',

                            "&:hover": {
                                backgroundColor: "primary.main",
                            },
                            "&::before": {
                                content: '""',
                                position: 'absolute',
                                top: '-10px',
                                bottom: '-10px',
                                left: 0,
                                right: 0
                            }
                        }}
                        onMouseDown={startDraggingHorizontal}
                        ref={horizontalDividerRef} // Attach the ref for the horizontal divider here
                    ></Box>
                    <Box
                        sx={{
                            flex: 1,
                            flexDirection: 'column',
                            overflow: 'hidden',
                            display: 'flex',
                            height: '30%',
                            
                        }}
                    >
                        {bottomComponent}
                    </Box>
                </>
            )}
        </Box>
    );
};