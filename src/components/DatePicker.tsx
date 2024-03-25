import { useDisclosure, useOutsideClick, Box, Popover, PopoverTrigger, Input, PopoverContent, PopoverBody, ChakraProvider } from '@chakra-ui/react';
import {
    CalendarDate, Calendar, CalendarControls, CalendarPrevButton, CalendarNextButton,
    CalendarMonths, CalendarMonth, CalendarMonthName, CalendarWeek, CalendarDays, CalendarValues, CalendarDefaultTheme
} from '@uselessdev/datepicker';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { format, isValid, addDays } from 'date-fns'

interface DatePickerProps {
    handleDate: Function;
    restrictDate?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ handleDate, restrictDate = false }) => {

    const [date, setDate] = useState<CalendarDate>()
    const [value, setValue] = useState('')

    const { isOpen, onOpen, onClose } = useDisclosure()

    const initialRef = useRef(null)
    const calendarRef = useRef(null)

    const handleSelectDate = (date: CalendarDate | CalendarValues) => {
        const calendarDate = date as CalendarDate;
        setDate(calendarDate)
        setValue(() => (isValid(date) ? format(calendarDate, 'MM/dd/yyyy') : format(addDays(new Date(), 5), 'MM/dd/yyyy')))
        onClose()
    }

    const match = (value: string) => value.match(/(\d{2})\/(\d{2})\/(\d{4})/)

    const handleInputChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
        setValue(target.value)

        if (match(target.value)) {
            onClose()
        }
    }

    useOutsideClick({
        ref: calendarRef,
        handler: onClose,
        enabled: isOpen,
    })

    useEffect(() => {
        const date = new Date(value)
        return handleDate(date)

    }, [value])

    return (
        <ChakraProvider theme={CalendarDefaultTheme}>
            <Box>
                <Popover
                    placement="auto-start"
                    isOpen={isOpen}
                    onClose={onClose}
                    initialFocusRef={initialRef}
                    isLazy
                >
                    <PopoverTrigger>
                        <Box onClick={onOpen} ref={initialRef}>
                            <Input
                                placeholder="mm/dd/yyyy"
                                value={value}
                                onChange={handleInputChange}
                                color={'white'}
                                autoComplete='off'
                            />
                        </Box>
                    </PopoverTrigger>

                    <PopoverContent
                        p={0}
                        w="min-content"
                        border="none"
                        outline="none"
                        _focus={{ boxShadow: 'none' }}
                        ref={calendarRef}
                    >
                        <Calendar
                            value={{ start: date }}
                            onSelectDate={handleSelectDate}
                            singleDateSelection
                            disablePastDates={restrictDate}
                        >
                            <PopoverBody p={0}>
                                <CalendarControls>
                                    <CalendarPrevButton />
                                    <CalendarNextButton />
                                </CalendarControls>

                                <CalendarMonths>
                                    <CalendarMonth>
                                        <CalendarMonthName />
                                        <CalendarWeek />
                                        <CalendarDays />
                                    </CalendarMonth>
                                </CalendarMonths>
                            </PopoverBody>
                        </Calendar>
                    </PopoverContent>
                </Popover>
            </Box>
        </ChakraProvider>
    )
};

export default DatePicker;
